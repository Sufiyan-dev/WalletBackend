import events from 'events';
import logger from '../logger/index.js';
const eventEmitter = new events();

import transactionModel from '../models/transaction.model.js';
import walletModel from '../models/wallet.model.js';
import { sendFromGmail } from '../utils/mailer.js';
import { assetOptinCheckerAndIndexerFinder } from '../utils/optinChecker.js';
import { queryWaiter } from '../utils/querySubgraph.js';
import { decrypt } from '../utils/SymEncrpyt.js';
import {
    getBalanceAndDecimal,
    sendToken,
    getEthBalance,
    waitForTxnToMint,
    getEthTransferGasEstimate,
    getMinimumAmount,
    tranderEthToUser,
    AppTokenAddress
} from '../utils/TransactionHelper.js';

/**
 *
 * @param {*} from username
 * @param {*} assetAddress
 * @param {*} amount
 * @param {*} to username
 * @returns
 */
const transferERC20 = async (from, assetAddress, amount, to) => {
    // lowercasing 
    assetAddress = assetAddress.toLowerCase();

    try {
    // first checking if from exist
        let FromuserData = await walletModel.findOne({ username: from });

        // checking if user is verified or not
        if (!FromuserData.verified) {
            return {
                status: false,
                message: 'Sender must verified email first',
            };
        }

        let ToUserdata = await walletModel.findOne({ username: to });

        // check if valid user
        if (!ToUserdata) {
            return {
                status: false,
                message: 'To user does not exist',
            };
        }

        // storing public address
        const fromAddress = FromuserData.walletInfo.publicKey;
        const toAddress = ToUserdata.walletInfo.publicKey;

        // getting eth balance of sender
        const fromEthBalance = await getEthBalance(fromAddress);

        // checking
        if (!fromEthBalance && fromEthBalance != 0) {
            return {
                status: false,
                message: 'get eth balance failed',
            };
        }

        // validating  balance
        if (fromEthBalance < 0.02) {
            return {
                status: false,
                message: 'minimum 0.02 eth balance is require to do txn',
            };
        }

        logger.debug(`Address of FROM ${fromAddress} and TO ${toAddress}`);

        // getting balance of FROM
        const fromAssetBalanceInfo = await getBalanceAndDecimal(
            assetAddress,
            fromAddress
        );

        const fromAssetBalance = fromAssetBalanceInfo.balance / 10 ** fromAssetBalanceInfo.decimals;

        // getting balance of TO
        const toAssetBalanceInfo = await getBalanceAndDecimal(
            assetAddress,
            toAddress
        );

        const toAssetBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals;

        // validating
        if (fromAssetBalance < amount) {
            return {
                status: false,
                message: 'Insufficient asset funds to transfer',
            };
        }
        logger.debug(`Asset balance of FROM is ${fromAssetBalance}`);

        // checking if asset exist in assetoptin
        const fromHasOptin = assetOptinCheckerAndIndexerFinder(
            FromuserData.walletInfo.assetsOptin,
            assetAddress
        );
        const toHasOptin = assetOptinCheckerAndIndexerFinder(
            ToUserdata.walletInfo.assetsOptin,
            assetAddress
        );

        if (!fromHasOptin.hasFound) {

            // adding asset info to user
            const obj = {
                address: assetAddress,
                assetType: 'erc20',
                lastBalance: fromAssetBalance - amount,
            };

            // pushing data in db
            FromuserData.walletInfo.assetsOptin.push(obj);
            FromuserData.save();

            // saving the index of that asset
            // indexAssetFrom = FromuserData.walletInfo.assetsOptin.length - 1;

        } else { // exist

            FromuserData.walletInfo.assetsOptin[fromHasOptin.index].lastBalance = fromAssetBalance - amount;
    
        }

        if (!toHasOptin.hasFound) {

            // adding asset info to user
            const obj = {
                address: assetAddress,
                assetType: 'erc20',
                lastBalance: toAssetBalance + amount,
            };

            // pushing data in db
            ToUserdata.walletInfo.assetsOptin.push(obj);
            ToUserdata.save();

            // saving the index of that asset
            // indexAssetTo = ToUserdata.walletInfo.assetsOptin.length - 1;
        } else {

            ToUserdata.walletInfo.assetsOptin[toHasOptin.index].lastBalance =
        toAssetBalance + amount;
        }

        const decryptPvtKey = decrypt(
            FromuserData.walletInfo.privateKey,
            FromuserData.walletInfo.publicKey
        );

        const success = await sendToken(
            decryptPvtKey,
            toAddress,
            assetAddress,
            'erc20',
            amount
        );

        if (!success) {
            return {
                status: false,
                message: 'Transfering token falied',
            };
        }

        // pushing tx to db
        await transactionModel.create({
            txHash: success.txHash,
            txStatus: 'Pending',
            fromAddress: fromAddress,
            toAddress: toAddress,
            tokenAddress: assetAddress,
            tokenAmount: amount,
            tokenType: 'erc20',
        });

        const dataToSend = `<p><b>Transaction details :</b><br><br><b>txHash:</b>${success.txHash}<br><br><b>Transaction status :</b> Pending <br><br><b>from:</b>${fromAddress}<br><b>to:</b>${toAddress}<br><b>amount:</b>${amount}<br><br><b>tokenAddress:</b>${assetAddress}<br><br><b>tokenType:</b>erc20<br><br><b>Link : </b>https://goerli.etherscan.io/tx/${success.txHash}</p>`;

        let emailSuccess = await sendFromGmail(
            `${dataToSend}`,
            'Transaction detail',
            FromuserData.email
        );

        if (!emailSuccess) {
            return {
                status: false,
                message: 'Email sending of txn to user failed',
            };
        }
        if(assetAddress == AppTokenAddress.toLowerCase()){
            eventEmitter.emit('newTxn',success.txHash,FromuserData.username,'appToken');
        } else {
            eventEmitter.emit('newTxn',success.txHash,FromuserData.username,'erc20');
        }


        return {
            status: true,
            message: 'Transfer success',
        };
    } catch (err) {
        logger.error(`transfer erc20 ERROR : ${err.message}`);
        return {
            status: false,
            statuscode: 500,
            message: err.message,
        };
    }
};

const checkBalanceOfUser = async (address, assetAddress) => {

    try {

        const balanceAndDecimalsOfUser = await getBalanceAndDecimal(
            assetAddress,
            address
        );

        const balance = Number(balanceAndDecimalsOfUser.balance) / Number(10 ** Number(balanceAndDecimalsOfUser.decimals));

        logger.debug(`balance of ${address} at contract ${assetAddress} is ${balance}`);
        if (!balanceAndDecimalsOfUser) {
            return {
                status: false,
                message: 'Get balance failed',
            };
        }

        const finalBalance = balance + ' ' + balanceAndDecimalsOfUser.symbol;
        logger.debug(`balance is : ${finalBalance}`);
        return {
            status: true,
            message: finalBalance,
        };

    } catch(err){
        logger.error(`check balance error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
};

const getTransactionOfSpecificUser = async (
    username,
    noOfTxns,
    skipNoOfTxns,
    jwtToken
) => {
    try {

        // first checking if from exist
        let exists = await walletModel.findOne({ username: username });
        if (!exists) {
            return {
                status: false,
                message: 'Invalid User',
            };
        }

        // getting caller detials
        if (jwtToken.username !== username) {
            return {
                status: false,
                message: 'not an valid user, to get the data',
            };
        }

        let Txns;
        if (skipNoOfTxns) {
            Txns = await transactionModel
                .find({
                    $or: [
                        { fromAddress: exists.walletInfo.publicKey },
                        { toAddress: exists.walletInfo.publicKey },
                    ],
                })
                .limit(noOfTxns)
                .skip(skipNoOfTxns);
        } else {
            Txns = await transactionModel
                .find({
                    $or: [
                        { fromAddress: exists.walletInfo.publicKey },
                        { toAddress: exists.walletInfo.publicKey },
                    ],
                })
                .limit(noOfTxns);
        }

        if (Txns.length == 0) {
            return {
                status: true,
                message: 'No transaction from that user or skip',
            };
        }

        return {
            status: true,
            message: Txns,
        };

    } catch(err){
        logger.error(`getTxn of user error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
};

const getTransactionOfAllUser = async (noOfTxns, skipNoOfTxns, jwtToken) => {
    try {

        // check if user is admin or not
        if (!jwtToken.isAdmin) {
            return {
                status: false,
                message: 'Invalid user, not an admin',
            };
        }

        let Txns;
        if (skipNoOfTxns) {
            Txns = await transactionModel.find().limit(noOfTxns).skip(skipNoOfTxns);
        } else {
            Txns = await transactionModel.find().limit(noOfTxns);
        }

        if (Txns.length == 0) {
            return {
                status: true,
                message: 'No transaction or skipped',
            };
        }

        return {
            status: true,
            message: Txns,
        };

    } catch(err){
        logger.error(`getTxn of all error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
};


const transferETH = async (fromUsername, toUsername, amountInEth) => {
    try {
        const fromUserData = await walletModel.findOne({ username: fromUsername });
        const toUserData = await walletModel.findOne({ username: toUsername });

        if (!fromUserData.verified) {
            return {
                status: false,
                message: 'Sender must verified email first',
            };
        }

        if (!toUserData) {
            return {
                status: false,
                message: 'To user does not exist',
            };
        }

        // getting eth balance of sender
        const fromEthBalance = await getEthBalance(
            fromUserData.walletInfo.publicKey
        );

        const decryptPvtKey = decrypt(
            fromUserData.walletInfo.privateKey,
            fromUserData.walletInfo.publicKey
        );

        const estGasAmount = await getEthTransferGasEstimate(
            decryptPvtKey,
            toUserData.walletInfo.publicKey,
            amountInEth
        );

        let minimumAmount = getMinimumAmount(amountInEth, estGasAmount);
        logger.debug(`total amount needed ${minimumAmount}`);

        // validating
        if (fromEthBalance < minimumAmount) {
            return {
                status: false,
                message: 'Insufficient asset funds to transfer',
            };
        }

        const result = await tranderEthToUser(
            decryptPvtKey,
            toUserData.walletInfo.publicKey,
            amountInEth
        );

        logger.debug(`Result ${result}`);
        if (!result) {
            return {
                status: false,
                message: 'Eth transfer failed',
            };
        }

        // pushing tx to db
        await transactionModel.create({
            txHash: result,
            txStatus: 'Pending',
            fromAddress: fromUserData.walletInfo.publicKey,
            toAddress: toUserData.walletInfo.publicKey,
            tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            tokenAmount: amountInEth,
            tokenType: 'ETH',
        });

        const dataToSend = `<p><b>Transaction details :</b><br><br><b>txHash:</b>${result}<br><br><b>Transaction status :</b> Pending <br><br><b>from:</b>${fromUserData.walletInfo.publicKey}<br><b>to:</b>${toUserData.walletInfo.publicKey}<br><b>amount:</b>${amountInEth}<br><br><b>transferType:</b>ETH transfer<br><br><b>Link : </b>https://goerli.etherscan.io/tx/${result}</p>`;

        let emailSuccess = await sendFromGmail(
            `${dataToSend}`,
            'Transaction detail',
            fromUserData.email
        );

        if (!emailSuccess) {
            return {
                status: false,
                message: 'Email sending of txn to user failed',
            };
        }

        eventEmitter.emit('newTxn', result, fromUserData.username, 'eth');

        return {
            status: true,
            message: 'Transfer success',
        };
    } catch (err) {
        logger.error(`transfer ETH error : ${err.message}`);
        return {
            status: false,
            message: err.message,
        };
    }
};


eventEmitter.on('newTxn', async (hash, username, txType) => {
    try {

        logger.debug(`new tx recived ${hash} username: ${username}`);

        // getting transction
        const txnData = await transactionModel.findOne({ txHash: hash });
        logger.debug(`data txn : ${txnData}`);

        // getting user info
        const userInfo = await walletModel.findOne({ username: username });

        // waiting for txn to get minted
        // eslint-disable-next-line no-unused-vars
        let status;
        // checking status
        if(txType == 'eth' || txType == 'erc20'){ // if any other txn than GLD token, app token
            const data = await waitForTxnToMint(hash);
            status = data ? 'Success' : 'Failed';
        }else  { // if it is an GLD token, app token
            const res = await queryWaiter(hash);
            status = res.Exist  ? 'Success' : 'Failed';
        }

        // data to send to mail
        const dataToSend = `<p><b>Transaction update :</b><br><br><b>txHash:</b>${hash}<br><br><b>Transaction status :</b> ${status} <br><br><b>Link : </b>https://goerli.etherscan.io/tx/${hash}</p>`;

        sendFromGmail(dataToSend, 'Txn Update', userInfo.email);

        // updating db of txn status
        txnData.txStatus = status;
        txnData.save();

        logger.debug(`status ${status}`);

    } catch(err){
        logger.error(`event emit listner 'newTxn' error : ${err.message}`);
    }
});

export {
    transferERC20,
    transferETH,
    checkBalanceOfUser,
    getTransactionOfSpecificUser,
    getTransactionOfAllUser,
};

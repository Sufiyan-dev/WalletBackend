import events from 'events';
const eventEmitter = new events();

import transactionModel from "../models/transaction.model.js"
import walletModel from "../models/wallet.model.js"
import { sendFromGmail } from "../utils/mailer.js"
import { assetOptinCheckerAndIndexerFinder } from "../utils/optinChecker.js"
import { decrypt } from "../utils/SymEncrpyt.js"
import { getBalanceAndDecimal, sendToken, getEthBalance, waitForTxnToMint, getEthTransferGasEstimate, getMinimumAmount, tranderEthToUser } from "../utils/TransactionHelper.js"


/**
 * 
 * @param {*} from username
 * @param {*} assetAddress 
 * @param {*} amount 
 * @param {*} to username
 * @returns 
 */
const transferERC20 = async (from, assetAddress, amount, to) => {
    assetAddress = assetAddress.toLowerCase()
    try {
        // first checking if from exist
        let FromuserData = await walletModel.findOne({ username: from })
        // if (!FromuserData) {
        //     return {
        //         status: "Failed",
        //         statuscode: 400,
        //         message: "Invalid Sender"
        //     }
        // }

        // checking if user is verified or not
        if (!FromuserData.verified) {
            return {
                status: "Failed",
                statuscode: 400,
                message: "Sender must verified email first"
            }
        }


        let ToUserdata = await walletModel.findOne({ username: to })

        // check if valid user 
        if (!ToUserdata) {
            return {
                status: "Failed",
                statuscode: 400,
                message: "To user does not exist"
            }
        }



        // storing public address 
        const fromAddress = FromuserData.walletInfo.publicKey
        const toAddress = ToUserdata.walletInfo.publicKey

        // getting eth balance of sender
        const fromEthBalance = await getEthBalance(fromAddress)
        console.log("balance", fromEthBalance)

        // checking 
        if (!fromEthBalance && fromEthBalance != 0) {
            return {
                status: "Failed",
                statuscode: 500,
                message: "get eth balance failed"
            }
        }

        // validating  balance
        if (fromEthBalance < 0.02) {
            return {
                status: "Failed",
                statuscode: 400,
                message: "minimum 0.02 eth balance is require to do txn"
            }
        }
        console.log(`Address of FROM ${fromAddress} and TO ${toAddress}`)


        // console.log(fromHasOptin)
        // console.log(toHasOptin)


        // getting balance of FROM
        const fromAssetBalanceInfo = await getBalanceAndDecimal(assetAddress, fromAddress)
        const fromAssetBalance = fromAssetBalanceInfo.balance / 10 ** fromAssetBalanceInfo.decimals

        // getting balance of TO
        const toAssetBalanceInfo = await getBalanceAndDecimal(assetAddress, toAddress)
        const toAssetBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals

        // validating
        if (fromAssetBalance < amount) {
            return {
                status: "Failed",
                statuscode: 400,
                message: "Insufficient asset funds to transfer"
            }
        }
        // console.log(`Asset balance of FROM is ${fromAssetBalance}`)

        // checking if asset exist in assetoptin
        const fromHasOptin = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin, assetAddress)
        const toHasOptin = assetOptinCheckerAndIndexerFinder(ToUserdata.walletInfo.assetsOptin, assetAddress)
        console.log("from ", fromHasOptin)
        console.log("to ", toHasOptin)
        if (!fromHasOptin.hasFound) {
            console.log("Optin asset from")

            // adding asset info to user
            const obj = {
                address: assetAddress,
                assetType: "erc20",
                lastBalance: fromAssetBalance - amount
            }
            console.log("length before push ", FromuserData.walletInfo.assetsOptin.length)

            // pushing data in db
            FromuserData.walletInfo.assetsOptin.push(obj)
            FromuserData.save()

            console.log("length after push ", FromuserData.walletInfo.assetsOptin.length)

            // saving the index of that asset
            indexAssetFrom = FromuserData.walletInfo.assetsOptin.length - 1
        } else { // exist
            console.log("exist from asset")

            console.log(" from Data of asset ", FromuserData.walletInfo.assetsOptin[fromHasOptin.index])

            FromuserData.walletInfo.assetsOptin[fromHasOptin.index].lastBalance = fromAssetBalance - amount;
        }

        if (!toHasOptin.hasFound) {
            console.log("Optin asset to")

            // adding asset info to user
            const obj = {
                address: assetAddress,
                assetType: "erc20",
                lastBalance: toAssetBalance + amount
            }

            console.log("length before push ", ToUserdata.walletInfo.assetsOptin.length)

            // pushing data in db
            ToUserdata.walletInfo.assetsOptin.push(obj)
            ToUserdata.save()

            console.log("length after push ", ToUserdata.walletInfo.assetsOptin.length)

            // saving the index of that asset
            indexAssetTo = ToUserdata.walletInfo.assetsOptin.length - 1
        } else {
            console.log("TO asset exist ")

            console.log(" to data of asset", ToUserdata.walletInfo.assetsOptin[toHasOptin.index])

            ToUserdata.walletInfo.assetsOptin[toHasOptin.index].lastBalance = toAssetBalance + amount
        }


        const decryptPvtKey = decrypt(FromuserData.walletInfo.privateKey, FromuserData.walletInfo.publicKey)

        const success = await sendToken(decryptPvtKey, toAddress, assetAddress, "erc20", amount)

        if (!success) {
            return {
                status: "Failed",
                statuscode: 500,
                message: "Transfering token falied"
            }
        }

        // pushing tx to db
        const txnData = await transactionModel.create({
            txHash: success.txHash,
            txStatus: "Pending",
            fromAddress: fromAddress,
            toAddress: toAddress,
            tokenAddress: assetAddress,
            tokenAmount: amount,
            tokenType: "erc20"
        })

        const dataToSend = `<p><b>Transaction details :</b><br><br><b>txHash:</b>${success.txHash}<br><br><b>Transaction status :</b> Pending <br><br><b>from:</b>${fromAddress}<br><b>to:</b>${toAddress}<br><b>amount:</b>${amount}<br><br><b>tokenAddress:</b>${assetAddress}<br><br><b>tokenType:</b>erc20<br><br><b>Link : </b>https://goerli.etherscan.io/tx/${success.txHash}</p>`

        let emailSuccess = await sendFromGmail(`${dataToSend}`, `Transaction detail`, FromuserData.email)

        if (!emailSuccess) {
            return {
                status: "Failed",
                statuscode: 500,
                message: "Email sending of txn to user failed"
            }
        }

        eventEmitter.emit("newTxn", success.txHash, FromuserData.username,"erc20");

        return {
            status: "Success",
            statuscode: 201,
            message: "Transfer success",
        }

    } catch (err) {
        console.log(err)
        return {
            status: "Failed",
            statuscode: 500,
            message: err.message
        }
    }

}

const checkBalanceOfUser = async (address,assetAddress) => {

    const balanceAndDecimalsOfUser = await getBalanceAndDecimal(assetAddress,address)

    // const balance = BigNumber.from(balanceAndDecimalsOfUser.balance).div(BigNumber.from(10).pow(balanceAndDecimalsOfUser.decimals))
    const balance = Number(balanceAndDecimalsOfUser.balance) / Number(10**Number(balanceAndDecimalsOfUser.decimals))
    // console.log("balance 2 ",balance2)

    console.log(`balance of ${address} at contract ${assetAddress} is ${balance}`)
    if(!balanceAndDecimalsOfUser){
        return {
            status: "Failed",
            statuscode: 500,
            message: "Get balance failed"
        }
    }

    const finalBalance = balance+ " " + balanceAndDecimalsOfUser.symbol

    return {
        status: "Success",
        statuscode: 201,
        message: finalBalance
    }
}

const getTransactionOfSpecificUser = async (username, noOfTxns, skipNoOfTxns, jwtToken) => {

    // first checking if from exist
    let exists = await walletModel.findOne({ username: username })
    if (!exists) {
        return {
            status: "Failed",
            statuscode: 400,
            message: "Invalid User"
        }
    }

     // getting caller detials
     if(jwtToken.username !== username){
        return {
            status: "Failed", statuscode: 400 ,message: "not an valid user, to get the data"
        }
    }

    let Txns
    if(skipNoOfTxns){
        Txns = await transactionModel.find({$or: [{fromAddress: exists.walletInfo.publicKey}, {toAddress: exists.walletInfo.publicKey}]}).limit(noOfTxns).skip(skipNoOfTxns)
    } else {
        Txns = await transactionModel.find({$or: [{fromAddress: exists.walletInfo.publicKey}, {toAddress: exists.walletInfo.publicKey}]}).limit(noOfTxns)
    }

     
    console.log(Txns)

    if(Txns.length == 0){
        return {
            status: "Success",
            statuscode: 201,
            message: "No transaction from that user or skip"
        }
    }

    return {
        status: "Success",
        statuscode: 201,
        message: Txns
    }
}

const getTransactionOfAllUser = async (noOfTxns, skipNoOfTxns, jwtToken) => {

    // check if user is admin or not
    if(!jwtToken.isAdmin){
        return {
            status: "Failed",
            statuscode: 400,
            message: "Invalid user, not an admin"
        }
    }

    let Txns
    if(skipNoOfTxns){
        Txns = await transactionModel.find().limit(noOfTxns).skip(skipNoOfTxns)
    } else {
        Txns = await transactionModel.find().limit(noOfTxns)
    }

     

    if(Txns.length == 0){
        return {
            status: "Success",
            statuscode: 201,
            message: "No transaction or skipped"
        }
    }

    return {
        status: "Success",
        statuscode: 201,
        message: Txns
    }

}

const transferETH = async (fromUsername, toUsername, amountInEth, jwtToken) => {
    try {

        const fromUserData = await walletModel.findOne({username: fromUsername})
        const toUserData = await walletModel.findOne({username: toUsername})

        if(!fromUserData.verified){
            return {
                status: "Failed",
                statuscode: 400,
                message: "Sender must verified email first"
            }
        }

        if(!toUserData){
            return {
                status: "Failed",
                statuscode: 400,
                message: "To user does not exist"
            }
        }

        // getting eth balance of sender
        const fromEthBalance = await getEthBalance(fromUserData.walletInfo.publicKey);


        const decryptPvtKey = decrypt(fromUserData.walletInfo.privateKey, fromUserData.walletInfo.publicKey)

        const estGasAmount = await getEthTransferGasEstimate(decryptPvtKey,toUserData.walletInfo.publicKey,amountInEth)
        let minimumAmount = getMinimumAmount(amountInEth,estGasAmount);
        console.log("total amount needed ",minimumAmount)

        // validating
        if (fromEthBalance < minimumAmount) {
            return {
                status: "Failed",
                statuscode: 400,
                message: "Insufficient asset funds to transfer"
            }
        }

        const result = await tranderEthToUser(decryptPvtKey,toUserData.walletInfo.publicKey,amountInEth);

        // console.group("Result ",result);
        if(!result){
            return {
                status: "Failed",
                statuscode: 400,
                message: "Eth transfer failed"
            }
        }

        // pushing tx to db
        const txnData = await transactionModel.create({
            txHash: result,
            txStatus: "Pending",
            fromAddress: fromUserData.walletInfo.publicKey,
            toAddress: toUserData.walletInfo.publicKey,
            tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            tokenAmount: amountInEth,
            tokenType: "ETH"
        })

        const dataToSend = `<p><b>Transaction details :</b><br><br><b>txHash:</b>${result}<br><br><b>Transaction status :</b> Pending <br><br><b>from:</b>${fromUserData.walletInfo.publicKey}<br><b>to:</b>${toUserData.walletInfo.publicKey}<br><b>amount:</b>${amountInEth}<br><br><b>transferType:</b>ETH transfer<br><br><b>Link : </b>https://goerli.etherscan.io/tx/${result}</p>`

        let emailSuccess = await sendFromGmail(`${dataToSend}`, `Transaction detail`, fromUserData.email)

        if (!emailSuccess) {
            return {
                status: "Failed",
                statuscode: 500,
                message: "Email sending of txn to user failed"
            }
        }

        eventEmitter.emit("newTxn", result, fromUserData.username,"eth");

        return {
            status: "Success",
            statuscode: 201,
            message: "Transfer success",
        }

    } catch(err) {
        console.log(err)
        return {
            status: "Failed",
            statuscode: 500,
            message: err.message
        }
    }
}


//
eventEmitter.on("newTxn",async (hash,username,type) => {
    console.log("new tx recived ",hash,username);

    // getting transction
    const txnData = await transactionModel.findOne({txHash: hash});

    // getting user info
    const userInfo = await walletModel.findOne({username: username});

    // waiting for txn to get minted
    let status
    waitForTxnToMint(hash).then((data) => {
        // checking status
        status = data ? "Success" : "Failed"

        // data to send to mail
        const dataToSend = `<p><b>Transaction update :</b><br><br><b>txHash:</b>${hash}<br><br><b>Transaction status :</b> ${status} <br><br><b>Link : </b>https://goerli.etherscan.io/tx/${hash}</p>`

        sendFromGmail(dataToSend,"Txn Update",userInfo.email)
    });
    // console.log("status ",status)

    // updating db of txn status
    txnData.txStatus = status;
    txnData.save();

})

export { transferERC20, transferETH, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser }
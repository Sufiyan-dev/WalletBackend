import transactionModel from "../models/transaction.model.js"
import walletModel from "../models/wallet.model.js"
import { sendFromGmail } from "../utils/mailer.js"
import { assetOptinCheckerAndIndexerFinder } from "../utils/optinChecker.js"
import { decrypt } from "../utils/SymEncrpyt.js"
import { getBalanceAndDecimal, sendToken, getEthBalance } from "../utils/TransactionHelper.js"


/**
 * 
 * @param {*} from username
 * @param {*} assetAddress 
 * @param {*} amount 
 * @param {*} to username
 * @returns 
 */
const transferERC20 = async (from ,assetAddress, amount, to) => {

    try {
        // first checking if from exist
        let FromuserData = await walletModel.findOne({ username: from })
        if (!FromuserData) {
            return {
                status: "Failed",
                message: "Invalid Sender"
            }
        }

        if(!FromuserData.verified){
            return {
                status: "Failed",
                message: "Sender must verified email first"
            }
        }


        let ToUserdata = await walletModel.findOne({ username: to })
        
        if(!ToUserdata){
            return {
                status: "Failed",
                message: "To user does not exist"
            }
        }

        
        
        
        const fromAddress = FromuserData.walletInfo.publicKey
        const toAddress = ToUserdata.walletInfo.publicKey
        
        const fromEthBalance = await getEthBalance(fromAddress)

        console.log("balance",fromEthBalance)

        if(!fromEthBalance && fromEthBalance !=0){
            return{
                status: "Failed",
                message: "get eth balance failed"
            }
        }

        if(fromEthBalance < 0.2){
            return {
                status: "Failed",
                message: "minimum 0.02 eth balance is require to do txn"
            }
        }



        console.log(`Address of FROM ${fromAddress} and TO ${toAddress}`)

        // checking if asset exist in assetoptin
        const fromHasOptin = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin,assetAddress)
        const toHasOptin = assetOptinCheckerAndIndexerFinder(ToUserdata.walletInfo.assetsOptin,assetAddress)
        console.log(fromHasOptin)
        console.log(toHasOptin)
        // getting balance 
        const fromAssetBalanceInfo = await getBalanceAndDecimal(assetAddress, fromAddress)
        const fromAssetBalance = fromAssetBalanceInfo.balance / 10**fromAssetBalanceInfo.decimals

        if(fromAssetBalance < amount){
            return {
                status: "Failed",
                message: "Insufficient asset funds to transfer"
            }
        }

        console.log(`Asset balance of FROM is ${fromAssetBalance}`)

        let indexAssetFrom, indexAssetTo

        if(!fromHasOptin.hasFound || !toHasOptin.hasFound){
            // adding asset info to user
            const obj = {
                address: assetAddress,
                assetType: "erc20",
                lastBalance: fromAssetBalance
            }

            if(!fromHasOptin.hasFound){
                console.log("Optin asset from")
                // pushing data in db
                FromuserData.walletInfo.assetsOptin.push(obj)
                FromuserData.save()

                // saving the index of that asset
                indexAssetFrom = FromuserData.walletInfo.assetsOptin.length - 1
            }

            if(!toHasOptin.hasFound){
                console.log("Optin asset to")
                // pushing data in db
                ToUserdata.walletInfo.assetsOptin.push(obj)
                ToUserdata.save()
                // saving the index of that asset
                indexAssetTo = ToUserdata.walletInfo.assetsOptin.length - 1
            }

            // console.log("asset optin obj", obj)
        }


        const decryptPvtKey = decrypt(FromuserData.walletInfo.privateKey,FromuserData.walletInfo.publicKey)


        const success =  await sendToken(decryptPvtKey,toAddress,assetAddress,"erc20",amount)

        if(!success){
            return {
                status: "Failed",
                message: "Transfering token falied"
            }
        }

         // getting balance 
         const fromAssetBalanceInfoFinal = await getBalanceAndDecimal(assetAddress, fromAddress)
         const toAssetBalanceInfo = await getBalanceAndDecimal(assetAddress, toAddress)

        // pushing tx to db
        const txnData = await transactionModel.create({
            txHash: success.txHash,
            fromAddress: fromAddress,
            toAddress: toAddress,
            tokenAddress: assetAddress,
            tokenAmount: amount,
            tokenType: "erc20"
        })

        // if(indexAssetFrom){
        //     console.log("From asset data ",FromuserData.walletInfo.assetsOptin[indexAssetFrom])
        //     // updating the balances in asset
        //     FromuserData.walletInfo.assetsOptin[indexAssetFrom].lastBalance = fromAssetBalanceInfoFinal.balance / 10 ** fromAssetBalanceInfoFinal.decimals
        //     FromuserData.save()
        // }

        // if(indexAssetTo){
        //     console.log("to asset data ",ToUserdata.walletInfo.assetsOptin[indexAssetTo])
        //     // updating the balances in asset
        //     ToUserdata.walletInfo.assetsOptin[indexAssetTo].lastBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals
        //     ToUserdata.save()
        // }

        // const FromOptinResult = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin,assetAddress)
        // const ToOptinResult = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin,assetAddress)

        FromuserData.walletInfo.assetsOptin[indexAssetFrom].lastBalance = fromAssetBalanceInfoFinal.balance / 10 ** fromAssetBalanceInfoFinal.decimals
        FromuserData.save()

        ToUserdata.walletInfo.assetsOptin[indexAssetTo].lastBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals
        ToUserdata.save()

        const dataToSend = `<p><b>Transaction details :</b><br><br><b>txHash:</b>${success.txHash}<br><br><b>from:</b>${fromAddress}<br><b>to:</b>${toAddress}<br><b>amount:</b>${amount}<br><br><b>tokenAddress:</b>${assetAddress}<br><br><b>tokenType:</b>erc20<br><br><b>Link : </b>https://goerli.etherscan.io/tx/${success.txHash}</p>`
        
        let emailSuccess = await sendFromGmail(`${dataToSend}`,`Transaction detail`,FromuserData.email)

        if(!emailSuccess){
            return {
                status: "Failed",
                message: "Email sending of txn to user failed"
            }
        }

        return {
            status: "Success",
            message: "Transfer success"
        }

    } catch (err) {
        console.log(err)
        return {
            status: "Failed",
            message: err.message
        }
    }

}

const checkBalanceOfUser = async (address,assetAddress) => {

    const balanceAndDecimalsOfUser = await getBalanceAndDecimal(assetAddress,address)
    console.log(`balance of ${address} at contract ${assetAddress} is ${balanceAndDecimalsOfUser.balance / 10**balanceAndDecimalsOfUser.decimals}`)
    if(!balanceAndDecimalsOfUser){
        return {
            status: "Failed",
            message: "Get balance failed"
        }
    }

    const finalBalance = (balanceAndDecimalsOfUser.balance / 10**balanceAndDecimalsOfUser.decimals)+ " " + balanceAndDecimalsOfUser.symbol

    return {
        status: "Success",
        message: finalBalance
    }
}

const getTransactionOfSpecificUser = async (username, noOfTxns, jwtToken) => {

    // first checking if from exist
    let exists = await walletModel.findOne({ username: username })
    if (!exists) {
        return {
            status: "Failed",
            message: "Invalid User"
        }
    }

     // getting caller detials
     if(jwtToken.username !== username){
        return {
            status: "Failed", message: "not an valid user, to get the data"
        }
    }

    const Txns = await transactionModel.find({$or: [{fromAddress: exists.walletInfo.publicKey}, {toAddress: exists.walletInfo.publicKey}]}).limit(noOfTxns)
    console.log(Txns)

    if(Txns.length == 0){
        return {
            status: "Success",
            message: "No transaction from that user"
        }
    }

    return {
        status: "Success",
        message: Txns
    }
}

const getTransactionOfAllUser = async (noOfTxns, jwtToken) => {

    // check if user is admin or not
    if(!jwtToken.isAdmin){
        return {
            status: "Failed",
            message: "Invalid user, not an admin"
        }
    }

    const Txns = await transactionModel.find().limit(noOfTxns)

    if(Txns.length == 0){
        return {
            status: "Success",
            message: "No transaction"
        }
    }

    return {
        status: "Success",
        message: Txns
    }

}

export { transferERC20, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser }
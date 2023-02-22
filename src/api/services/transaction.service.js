import transactionModel from "../models/transaction.model.js"
import walletModel from "../models/wallet.model.js"
import { assetOptinCheckerAndIndexerFinder } from "../utils/optinChecker.js"
import { getBalanceAndDecimal, sendToken, getEthBalance } from "../utils/TransactionHelper.js"



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
                FromuserData.save()

                // saving the index of that asset
                indexAssetTo = FromuserData.walletInfo.assetsOptin.length - 1
            }

            // console.log("asset optin obj", obj)
        }




        const success =  await sendToken(FromuserData.walletInfo.privateKey,toAddress,assetAddress,"erc20",amount)

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
        transactionModel.create({
            txHash: success.txHash,
            fromAddress: fromAddress,
            toAddress: toAddress,
            tokenAddress: assetAddress,
            tokenAmount: amount * 10**fromAssetBalanceInfo.decimals,
            tokenType: "erc20"
        })

        if(indexAssetFrom){
            // updating the balances in asset
            FromuserData.walletInfo.assetsOptin[indexAssetFrom].lastBalance = fromAssetBalanceInfoFinal.balance / 10 ** fromAssetBalanceInfoFinal.decimals
            FromuserData.save()
        }

        if(indexAssetTo){
            // updating the balances in asset
            ToUserdata.walletInfo.assetsOptin[indexAssetFrom].lastBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals
            ToUserdata.save()
        }

        const FromOptinResult = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin,assetAddress)
        const ToOptinResult = assetOptinCheckerAndIndexerFinder(FromuserData.walletInfo.assetsOptin,assetAddress)

        FromuserData.walletInfo.assetsOptin[FromOptinResult.index].lastBalance = fromAssetBalanceInfoFinal.balance / 10 ** fromAssetBalanceInfoFinal.decimals
        FromuserData.save()

        ToUserdata.walletInfo.assetsOptin[ToOptinResult.index].lastBalance = toAssetBalanceInfo.balance / 10 ** toAssetBalanceInfo.decimals
        ToUserdata.save()



        return {
            status: "Success",
            message: "Transfer success"
        }


        

    } catch (err) {
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

const getTransactionOfSpecificUser = async (username, noOfTxns) => {
    // first checking if from exist
    let exists = await walletModel.findOne({ username: username })
    if (!exists) {
        return {
            status: "Failed",
            message: "Invalid User"
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

const getTransactionOfAllUser = async (noOfTxns) => {

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
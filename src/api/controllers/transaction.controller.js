import { transferERC20, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser, transferETH } from "../services/transaction.service.js"
import { validateGetTxnOfAll, validateGetTxnOfUser, validateTransferTokenTxn, validateBalanceCheck } from "../validation/txnValidation.js"


const tokenTransfer = async (req,res) => {
    const {contractAddress, amount, to} = req.body

    const token = req.jwtToken

    const user = token.username

    // obj 
    const obj = {
        user: user,
        contractAddress: contractAddress,
        amount: amount,
        to: to
    }

    const resp = validateTransferTokenTxn(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const result = await transferERC20(user, contractAddress, amount, to)
    res.status(result.statuscode).json(result)
}

const ethTransfer = async (req,res) => {
    const { to, amount} = req.body
    const token = req.jwtToken

    const result = await transferETH(token.username, to, amount, token)

    res.send(result)

}

const balanceCheck = async (req,res) => {
    const { address, contractAddress} = req.body

    // obj
    const obj = {
        address: address,
        contractAddress: contractAddress
    }

    const resp = validateBalanceCheck(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const result = await checkBalanceOfUser(address,contractAddress)
    res.status(result.statuscode).json(result)
}

const getTransactionOfUser = async (req,res) => {
    console.log("inside")

    console.log(req.params)
    
    const noOfTxns = req.params.txns
    const skipNoOfTxns = req.params.skip
    const token = req.jwtToken
    const username = token.username
    console.log(noOfTxns,skipNoOfTxns)

    const obj = {
        username: username,
        noOfTxns: noOfTxns
    }

    const resp = validateGetTxnOfUser(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const result = await getTransactionOfSpecificUser(username, noOfTxns, token)
    res.status(result.statuscode).json(result)
}

const getTransactionOfAll = async (req,res) => {
    const noOfTxns = req.params.txns
    const skipNoOfTxns = req.params.skip
    console.log(noOfTxns,skipNoOfTxns)

    const obj = {
        noOfTxns: noOfTxns
    }

    const resp = validateGetTxnOfAll(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const token = req.jwtToken
    const result = await getTransactionOfAllUser(noOfTxns, skipNoOfTxns, token)
    res.status(result.statuscode).json(result)
}

export { ethTransfer, tokenTransfer, balanceCheck, getTransactionOfUser, getTransactionOfAll }
import { transferERC20, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser } from "../services/transaction.service.js"
import { validateGetTxnOfAll, validateGetTxnOfUser, validateTransferTokenTxn } from "../validation/txnValidation.js"


const tokenTransfer = async (req,res) => {
    const user = req.params.username
    const { contractAddress, amount, to} = req.body

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
    res.send(result)
}

const balanceCheck = async (req,res) => {
    const address = req.params.address
    const contractAddress = req.body.contractAddress

    // obj
    const obj = {
        address: address,
        contractAddress: contractAddress
    }

    const resp = validateTransferTokenTxn(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const result = await checkBalanceOfUser(address,contractAddress)
    res.send(result)
}

const getTransactionOfUser = async (req,res) => {
    const username = req.params.user
    const noOfTxns = req.params.txnsNumber
    const token = req.jwtToken


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
    res.send(result)
}

const getTransactionOfAll = async (req,res) => {
    const noOfTxns = req.params.txnsNumber

    const obj = {
        noOfTxns: noOfTxns
    }

    const resp = validateGetTxnOfAll(obj);

    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

    const token = req.jwtToken
    const result = await getTransactionOfAllUser(noOfTxns, token)
    res.send(result)
}

export { tokenTransfer, balanceCheck, getTransactionOfUser, getTransactionOfAll }
import { transferERC20, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser } from "../services/transaction.service.js"


const tokenTransfer = async (req,res) => {
    const user = req.params.username
    const { contractAddress, amount, to} = req.body
    const result = await transferERC20(user, contractAddress, amount, to)
    res.send(result)
}

const balanceCheck = async (req,res) => {
    const address = req.params.address
    const contractAddress = req.body.contractAddress
    const result = await checkBalanceOfUser(address,contractAddress)
    res.send(result)
}

const getTransactionOfUser = async (req,res) => {
    const username = req.params.user
    const noOfTxns = req.params.txnsNumber
    const result = await getTransactionOfSpecificUser(username, noOfTxns)
    res.send(result)
}

const getTransactionOfAll = async (req,res) => {
    const noOfTxns = req.params.txnsNumber
    const result = await getTransactionOfAllUser(noOfTxns)
    res.send(result)
}

export { tokenTransfer, balanceCheck, getTransactionOfUser, getTransactionOfAll }
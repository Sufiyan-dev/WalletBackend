import { balanceCheck, tokenTransfer, getTransactionOfAll, getTransactionOfUser } from "../controllers/transaction.controller.js"


const transferToken = (req,res) => {
    tokenTransfer(req,res)
}

const checkBalanceOfToken = (req,res) => {
    balanceCheck(req,res)
}

const getTransactionAll = (req,res) => {
    getTransactionOfAll(req,res)
}

const getTransaction = (req,res) => {
    getTransactionOfUser(req,res)
} 

export { transferToken, checkBalanceOfToken, getTransactionAll, getTransaction }
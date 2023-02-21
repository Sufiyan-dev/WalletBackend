import { balanceCheck, tokenTransfer } from "../controllers/transaction.controller.js"


const transferToken = (req,res) => {
    tokenTransfer(req,res)
}

const checkBalanceOfToken = (req,res) => {
    balanceCheck(req,res)
}

export { transferToken, checkBalanceOfToken }
import express from 'express';
const router = express.Router()

import { balanceCheck, tokenTransfer, getTransactionOfAll, getTransactionOfUser } from "../controllers/transaction.controller.js"

router.post('/transfer/token',tokenTransfer)

router.get("/check/balance",balanceCheck)

router.get("/transaction/all/:txns/:skip",getTransactionOfAll)

router.get("/transaction/:txns/:skip",getTransactionOfUser)


export default router
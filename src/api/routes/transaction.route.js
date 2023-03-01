import express from 'express';
const router = express.Router()

import { balanceCheck, tokenTransfer, getTransactionOfAll, getTransactionOfUser } from "../controllers/transaction.controller.js"

router.post('/transfer/token/:username',tokenTransfer)

router.get("/check/balance/:address",balanceCheck)

router.get("/transaction/all/:txnsNumber",getTransactionOfAll)

router.get("/transaction/:user/:txnsNumber",getTransactionOfUser)


export default router
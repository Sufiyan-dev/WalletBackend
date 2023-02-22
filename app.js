import express from 'express'
import dotenv from 'dotenv'

import { signin, signup } from './src/api/routes/user.route.js'
import { confirmOtp, generateOtp } from './src/api/routes/otp.route.js';
import { checkBalanceOfToken, transferToken, getTransaction, getTransactionAll } from './src/api/routes/transaction.route.js';
dotenv.config()

const app = express();
app.use(express.json())

app.get('/',(req,res) => {
    res.send("Hey")
})

app.post('/signin/:username',signin)

app.post('/signup/:username',signup)

app.post('/otp/generate/:username',generateOtp)

app.post("/otp/confirm/:username",confirmOtp)

app.post("/transfer/token/:username",transferToken)

app.get("/check/balance/:address",checkBalanceOfToken)

app.get("/transaction/all/:txnsNumber",getTransactionAll)

app.get("/transaction/:user/:txnsNumber",getTransaction)

const PORT = process.env.PORT || 3000
app.listen(PORT,() => console.log(`App listening to http://localhost:${PORT}`))
import db from "../../config/db.config.js";
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    txHash:String,
    fromAddress:String,
    toAddress:String,
    tokenAddress:String,
    tokenAmount:String,
    tokenType:String,
})

const transactionModel = db.model("Transactions",transactionSchema);

export default transactionModel
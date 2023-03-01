import db from '../../config/db.config.js';
import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    verified:Boolean,
    isAdmin: Boolean,
    walletInfo: {
        publicKey: String,
        privateKey: String,
        assetsOptin: [{
            address: String,
            assetType: String,
            lastBalance: Number
        }]
    }
})

const walletModel = db.model("Wallet",walletSchema)

export default walletModel
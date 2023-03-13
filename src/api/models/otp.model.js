import db from '../../config/db.config.js';
import mongoose from 'mongoose';

const optSchema = new mongoose.Schema({
    email:String,
    otp:String,
    createdAt:Number,
    expiredAt:Number
});

const OtpModel = db.model('Otp',optSchema);

export default OtpModel;
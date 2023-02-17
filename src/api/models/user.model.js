import db from '../../config/db.config.js';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:String,
    email:String
})

export const userModel = db.model('Users',userSchema);

// db.model('Users',userModel);
// export  
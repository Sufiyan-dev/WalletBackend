import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

// console.log(process.env.mongoURI)

mongoose.connect(process.env.mongoURI)

const db = mongoose.connection

db.on('connected', () => {
    console.log('database is connected successfully');
});
db.on('disconnected',() => {
    console.log('database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'connection error:'));

export default db
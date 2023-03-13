import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../api/logger/index.js';
dotenv.config();


// eslint-disable-next-line no-undef
mongoose.connect(process.env.mongoURI);

const db = mongoose.connection;

db.on('connected', () => {
    logger.info('database is connected successfully');
});
db.on('disconnected',() => {
    logger.info('database is disconnected successfully');
});
db.on('error', (error) => {
    logger.error(error, 'connection error:');
});

export default db;
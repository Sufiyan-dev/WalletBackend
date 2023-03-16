import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from '../logger/index.js';
dotenv.config();


// eslint-disable-next-line no-undef
const saltRounds = Number(process.env.saltRounds);

const generateHashFromPassword = async (password) => {

    try {
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(password,salt);
        return hash;
    } catch(err){
        logger.error(`generateHash of pass error : ${err.message}`);
        return false;
    }
    
};

const checkPassword = async (password, passHash) => {
    let isMatched = await bcrypt.compare(password,passHash);
    return isMatched;
};

export {generateHashFromPassword, checkPassword};
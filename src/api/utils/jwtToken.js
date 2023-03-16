import dotenv from 'dotenv';
import JWT from 'jsonwebtoken';

import logger from '../logger/index.js';

dotenv.config();

// eslint-disable-next-line no-undef
const jsonSecret = process.env.JWT_SECRET_KEY;

const jwtGenerate = (data) => {
    try {
        const token = JWT.sign(data,jsonSecret,{expiresIn: 300}); // 5 mins
        return token;
    } catch(err){
        logger.error(`jwt sign error : ${err.message}`);
        return false;
    }
};

const jwtVerify = (token) => {
    try {
        const verify = JWT.verify(token,jsonSecret);
        return {'status': true, 'message': verify};
    } catch(err){
        logger.debug(`jwt error : ${err.message}`);
        return {'status': false, 'message': err.message};
    }

};

export {jwtGenerate, jwtVerify};
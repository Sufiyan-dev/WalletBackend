import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import smtpTransport from 'nodemailer-smtp-transport';
import logger from '../logger/index.js';

dotenv.config();

/**
 * Gmail opt sending 
 * @param {number} otp 
 * @param {string} to 
 */
async function sendFromGmail(data, topic, to) {

    try {
        // NOTE: NEED TO ON LESS SECURE APP OR CREATE APP PASSWORD
        const transport = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
            // eslint-disable-next-line no-undef
                user: process.env.mail,
                // eslint-disable-next-line no-undef
                pass: process.env.password
            }
        }));

        let mailDetails = {
            from: 'madmax7874@gmail.com',
            to: to,
            subject: `${topic}`,
            html: `${data}`
        };

        let response = await transport.sendMail(mailDetails);
        logger.debug(`Mail resposne : ${response}`);
        if(response.rejected.length == 0){
            return true;
        } else {
            return false;
        }
    } catch(err){
        logger.error(`send email error : ${err.message}`);
        return false;
    }
}


export { sendFromGmail};
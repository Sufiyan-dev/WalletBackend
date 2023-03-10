import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import smtpTransport from 'nodemailer-smtp-transport';

dotenv.config()

/**
 * Gmail opt sending 
 * @param {number} otp 
 * @param {string} to 
 */
async function sendFromGmail(data, topic, to) {


    // NOTE: NEED TO ON LESS SECURE APP OR CREATE APP PASSWORD
    const transport = nodemailer.createTransport(smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
            user: process.env.mail,
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
    console.log(response)
    if(response.rejected.length == 0){
        return true
    } else {
        return false
    }
}


export { sendFromGmail}
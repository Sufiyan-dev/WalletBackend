import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import smtpTransport from 'nodemailer-smtp-transport';

dotenv.config()

/**
 * Gmail opt sending 
 * @param {number} otp 
 * @param {string} to 
 */
async function sendFromGmail(otp, to) {

    // let mailTransporter = nodemailer.createTransport({
    //     service: 'smtps.xfinite.io',
    //     port: 587, // 465
    //     secure: false, // true
    //     auth: {
    //         user: 'sufiyan.memon@xfinite.io',
    //         pass: 'Xfinite@123'
    //     }
    // });


    // NOTE: NEED TO ON LESS SECURE APP
    const transport = nodemailer.createTransport(smtpTransport({
        service: "Gmail",
        auth: {
            user: process.env.mail,
            pass: process.env.password
        }
    }));
    

    // let mailTransporter = nodemailer.createTransport('smtp://sufiyan.memon@xfinite.io:Xfinite@123@smtp.xfinite.io');

    let mailDetails = {
        from: 'sufiyan.memon@xfinite.io',
        to: to,
        subject: 'OTP for verifing',
        html: `<p>OTP is <b>${otp}</b>. It is valid for 1 hour </p>`
    };

    // mailTransporter.sendMail(mailDetails, function (err, data) {
    //     if (err) {
    //         console.log('Error Occurs', err);
    //     } else {
    //         console.log('Email sent successfully',data);
    //     }

    let response = await transport.sendMail(mailDetails);
    console.log(response)
    if(response.rejected.length == 0){
        return true
    } else {
        return false
    }
    // });
}


async function sendMail(otp,to){
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.ethrealUsername,
                pass: process.env.ethrealPassword
            }
        });

        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <bret.white@ethereal.email>', // sender address
            to: `${to}`, // list of receivers
            subject: "Verification", // Subject line
            html: `<p>Your OTP is <b>${otp}</b>. It is valid for only 1 hour !</p>`, // html body
        });
        // console.log("info ",info)
        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        if (info.rejected.length == 0) {
            return true
        } else {
            return false
        }
    } catch(err){
        console.log("nodemailer error ",err)
        return false
    }
}

export { sendMail,  sendFromGmail}

// ethreal(1234,'123@gmail.com');

// sendFromGmail(9999,'abdulbaqui.2000@gmail.com')


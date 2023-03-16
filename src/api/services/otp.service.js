import walletModel from '../models/wallet.model.js';
import OtpModel from '../models/otp.model.js';
import { checkPassword, generateHashFromPassword } from '../utils/hashPassword.js';
import { sendFromGmail } from '../utils/mailer.js';
import { AppTokenAddress, sendToken } from '../utils/TransactionHelper.js';
import logger from '../logger/index.js';


const sendOtp = async (username, jwtTokenData) => {

    try {

        if(jwtTokenData.verified){
            return {
                status: false,
                message: 'User already verfied'
            };
        }

        // genrating otp
        const OTP = Math.floor(1000 + Math.random() * 9000);

        let otpString = OTP.toString();

        let otpHash = await generateHashFromPassword(otpString);
        logger.debug(`otp hash : ${otpHash} `);

        // 
        let mail = jwtTokenData.email;

        // storing data in db
        OtpModel.create({
            email: mail,
            otp: otpHash,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000  // 1 hour of time to expire
        });

        let sended = await sendFromGmail(`<p>OTP is <b>${OTP}</b>. It is valid for 1 hour </p>`,'OTP for verifing',mail);

        if(sended){
            return {
                status: true,
                message: `Mail sended success to ${mail}`
            };
        }else{
            return {
                status: false,
                message: 'Mail send failed'
            };
        }


    } catch (err) {
        logger.error(`sending otp error : ${err.message}`);
        return {
            status: false,
            message: err.message 
        };
    }
};

const confirmOtp = async (user, jwtTokenData, otp) => {
    try {
        const username = jwtTokenData.username;
        const email = jwtTokenData.email;
        // getting the user datails
        let userData = await walletModel.findOne({ username: username });

        // validate
        if(!userData){
            return {
                status: false,
                message: 'Invalid User'
            };
        }

        // gettign the otp details of that user
        let otpDetailsArray = await OtpModel.find({email: email});
        logger.debug(`otp data fetched length : ${otpDetailsArray.length}`);
        if(otpDetailsArray.length == 0){
            return {
                status: false,
                message: 'No otp generated yet'
            };
        }

        // getting the latest otp
        let otpDetails = otpDetailsArray[otpDetailsArray.length - 1];
        logger.debug(`Otp details : ${JSON.stringify(otpDetails)}`);

        if(otpDetails.expiredAt < Date.now()){
            return {
                status: false,
                message: 'OTP expired'
            };
        }

        let otpHash = otpDetails.otp;

        let otpString = otp.toString();

        // check if otp is true or not
        let valid = await checkPassword(otpString,otpHash);

        logger.debug(`valid ${valid}`);
        if(!valid){
            return {
                status: false,
                message: 'Invalid OTP'
            };
        }

        // sending 10 tokens to new user
        let success = await sendToken('',userData.walletInfo.publicKey, AppTokenAddress, 'erc20', 10);

        if (!success) {
            return {
                status: false,
                message: 'Token sending error'
            };
        }

        // object of asset that user have optin
        const assetData = {
            address: AppTokenAddress,
            assetType: 'erc20',
            lastBalance: 10
        };

        // updating the data 
        userData.verified = true;
        userData.walletInfo.assetsOptin.push(assetData);
        userData.save();  

        // deleting all the otp
        await OtpModel.deleteMany({email: userData.email});

        return {
            status: true,
            message: userData
        };

    } catch(err){
        logger.error(`confirm opt error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
};

export {sendOtp, confirmOtp};
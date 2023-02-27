import walletModel from "../models/wallet.model.js"
import OtpModel from "../models/otp.model.js"
import { checkPassword, generateHashFromPassword } from "../utils/hashPassword.js"
import { sendFromGmail, sendMail } from "../utils/mailer.js"
import { AppTokenAddress, sendToken } from "../utils/TransactionHelper.js"
import { jwtVerify } from "../utils/jwtToken.js"


const sendOtp = async (username, jwtTokenData) => {

    try {

        console.log("toke info", jwtTokenData)

        // get details of user from db
        // let userData = await walletModel.findOne({ username: username })

        // if not a valid user
        // if (!userData) {
        //     return {
        //         status: "Failed",
        //         message: "Invalid username",
        //     }
        // }

        if(/*userData.verified*/ jwtTokenData.verified){
            return {
                status: "failed",
                message: "User already verfied"
            }
        }

        // genrating otp
        const OTP = Math.floor(1000 + Math.random() * 9000)
        console.log("otp generated ",OTP);

        let otpString = OTP.toString()

        let otpHash = await generateHashFromPassword(otpString)
        console.log("otp hash ",otpHash);

        // 
        let mail = userData.email;

        // storing data in db
        OtpModel.create({
            email: mail,
            otp: otpHash,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000  // 1 hour of time to expire
        })

        let sended = await sendFromGmail(`<p>OTP is <b>${OTP}</b>. It is valid for 1 hour </p>`,`OTP for verifing`,mail);

        if(sended){
            return {
                status: "Success",
                message: `Mail sended success to ${mail}`
            }
        }else{
            return {
                status: "Failed",
                message: "Mail send failed"
            }
        }


    } catch (err) {
        return {
            status: "Failed error",
            message: err.message 
        }
    }
}

const confirmOtp = async (username, otp) => {
    // getting the user datails
    let userData = await walletModel.findOne({ username: username })

    // validate
    if(!userData){
        return {
            status: "Failed",
            message: "Invalid User"
        }
    }

    // gettign the otp details of that user
    let otpDetailsArray = await OtpModel.find({email: userData.email})
    // console.log("user details ",otpDetails)
    if(otpDetailsArray.length == 0){
        return {
            status: "Failed",
            message: "No otp generated"
        }
    }

    // getting the latest otp
    let otpDetails = otpDetailsArray[otpDetailsArray.length - 1]
    console.log(otpDetails)

    if(otpDetails.expiredAt < Date.now()){
        return {
            status: "Failed",
            message: "OTP expired"
        }
    }

    let otpHash = otpDetails.otp

    let otpString = otp.toString();

    // check if otp is true or not
    let valid = await checkPassword(otpString,otpHash)

    console.log("valid", valid)
    if(!valid){
        return {
            status: "Failed",
            message: "Invalid OTP"
        }
    }

    // sending 10 tokens to new user
    let success = await sendToken("",userData.walletInfo.publicKey, AppTokenAddress, 'erc20', 10)

    if (!success) {
        return {
            status: "Failed",
            message: "Token sending error"
        }
    }

    // object of asset that user have optin
    const assetData = {
        address: AppTokenAddress,
        assetType: 'erc20',
        lastBalance: 10
    }

    // updating the data 
    userData.verified = true
    userData.walletInfo.assetsOptin.push(assetData)
    userData.save()  

    // deleting all the otp
    await OtpModel.deleteMany({email: userData.email})

    return {
        status: "Success",
        message: userData
    }
}

export {sendOtp, confirmOtp}
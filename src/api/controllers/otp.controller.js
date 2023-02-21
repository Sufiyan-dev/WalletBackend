import { confirmOtp, sendOtp } from "../services/otp.service.js"


const generateOtpForUser = async (req,res) => {
    // getting the username 
    const username = req.params.username

    // validation here 

    // calling service 
    let result = await sendOtp(username);

    // sending the result back
    res.send(result);
}

const verifyOtpOfUser = async (req,res) => {
    // getting the data
    const username = req.params.username
    console.log("bodyr",req.body)
    const otp = req.body.otp

    // validation here

    // calling the service
    const result = await confirmOtp(username,otp);

    // sending the resposne back
    res.send(result)
}

export { generateOtpForUser, verifyOtpOfUser}
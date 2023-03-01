import { confirmOtp, sendOtp } from "../services/otp.service.js"
import { jwtVerify } from "../utils/jwtToken.js"
import { validateConfirmOtp, validateGenerateOtp } from "../validation/otpValidation.js"


const generateOtpForUser = async (req,res) => {
    // getting the username 
    const username = req.params.username

    // validation here 
    const resp = validateGenerateOtp({username: username})
    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: result.message})
        return
    }

    // validating jwt
    const token = req.jwtToken
    console.log(token)



    // calling service 
    let result = await sendOtp(username, token);

    // sending the result back
    res.send(result);
}

const verifyOtpOfUser = async (req,res) => {
    // getting the data
    const username = req.params.username
    const token = req.jwtToken

    console.log("bodyr",req.body)
    const otp = req.body.otp

     // validation here 
     const resp = validateConfirmOtp({username: username, otp: otp})
     if(resp.status){
         res.status(400).json({ status:"Failed" ,message: result.message})
         return
     }

    // calling the service
    const result = await confirmOtp(username,token,otp);

    // sending the resposne back
    res.send(result)
}

export { generateOtpForUser, verifyOtpOfUser}
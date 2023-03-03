import { confirmOtp, sendOtp } from "../services/otp.service.js"
import { jwtVerify } from "../utils/jwtToken.js"
import { validateConfirmOtp, validateGenerateOtp } from "../validation/otpValidation.js"


const generateOtpForUser = async (req,res) => {


      // validating jwt
      const token = req.jwtToken
    //   console.log(token)

    // getting the username 
    const username = token.username

    // validation here 
    const resp = validateGenerateOtp({username: username})
    if(resp.status){
        res.status(400).json({ status:"Failed" ,message: resp.message})
        return
    }

  



    // calling service 
    let result = await sendOtp(username, token);

    // sending the result back
    res.status(result.statuscode).json(result);
}

const verifyOtpOfUser = async (req,res) => {
    
    
    const token = req.jwtToken

    // getting the data
    const username = token.username
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
    res.status(result.statuscode).json(result)
}

export { generateOtpForUser, verifyOtpOfUser}
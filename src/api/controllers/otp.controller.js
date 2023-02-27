import { confirmOtp, sendOtp } from "../services/otp.service.js"
import { jwtVerify } from "../utils/jwtToken.js"


const generateOtpForUser = async (req,res) => {
    // getting the username 
    const username = req.params.username

    // validation here 
    // validating jwt
    const token = req.jwtToken
    console.log(token)

    // if(!token){
    //     res.status(404).send("jwt missing")
    // }

    // const check = jwtVerify(token)
    // console.log("check ",check)

    // if(!check.status){
    //     const data =  {
    //         status: "Failed",
    //         message: check.message
    //     }

    //     res.status(400).send(data)
    // }

    // calling service 
    let result = await sendOtp(username, token);

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
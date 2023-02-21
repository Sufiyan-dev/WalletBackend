import { generateOtpForUser, verifyOtpOfUser } from "../controllers/otp.controller.js"

const generateOtp = (req,res) => {
    generateOtpForUser(req,res)
}

const confirmOtp = (req,res) => {
    verifyOtpOfUser(req,res)
}

export {generateOtp, confirmOtp}
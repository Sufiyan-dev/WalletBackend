import express from 'express';
const router = express.Router();

import { generateOtpForUser, verifyOtpOfUser } from "../controllers/otp.controller.js"

router.post('/otp/generate',generateOtpForUser)

router.post("/otp/confirm",verifyOtpOfUser)

export default router
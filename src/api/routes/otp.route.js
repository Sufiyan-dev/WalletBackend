import express from 'express';
const router = express.Router();

import { generateOtpForUser, verifyOtpOfUser } from "../controllers/otp.controller.js"

router.post('/otp/generate/:username',generateOtpForUser)

router.post("/otp/confirm/:username",verifyOtpOfUser)

export default router
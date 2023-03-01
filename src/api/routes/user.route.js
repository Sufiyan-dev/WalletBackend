import express from 'express';
const router = express.Router();

import { signinControl, signupController } from "../controllers/user.controller.js";

router.post('/signin/:username',signinControl)
router.post('/signup/:username',signupController)

export default router
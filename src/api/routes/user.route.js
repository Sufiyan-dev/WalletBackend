import express from 'express';
const router = express.Router();

import { optinController, signinControl, signupController } from '../controllers/user.controller.js';

router.post('/signin/:username',signinControl);
router.post('/signup',signupController);
router.post('/optin',optinController);

export default router;
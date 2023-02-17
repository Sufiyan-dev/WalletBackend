import express from "express";
const router = express.Router()
import mongoose from "mongoose";
import { signinControl, signupController } from "../controllers/user.controller.js";
import walletModel from "../models/wallet.model.js";

const signin = (req,res) => {
    signinControl(req,res)
}

const signup = (req,res) => {
    signupController(req,res)
}

export { signin, signup }
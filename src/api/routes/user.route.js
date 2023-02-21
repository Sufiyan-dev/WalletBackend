import { signinControl, signupController } from "../controllers/user.controller.js";

const signin = (req,res) => {
    signinControl(req,res)
}

const signup = (req,res) => {
    signupController(req,res)
}

export { signin, signup }
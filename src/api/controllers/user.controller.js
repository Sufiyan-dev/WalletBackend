import { getUser, registerUser } from "../services/user.service.js"
import {validateNewUser, validateExistingUser} from "../validation/userValidation.js"


async function signinControl(req, res){
    // console.log("params ",req.params)
    // console.log("body ",req.body)
   // getting the email
   let username = req.params.username

   // getting password
   let password = req.body.password

   const obj = {
    username: username,
    password: password
   }

   const result = validateExistingUser(obj)
   if(result.status){
    res.status(400).json({ status:"Failed" ,message: result.message})
    return
   }
       let response = await getUser(username, password)
       console.log("controller signin response received : ",response)
       res.status(response.statuscode).json(response) 
}

async function signupController(req,res){
    const { username, email, password, confirmPassword, walletAddress, walletPvtAddress, adminPass} = req.body
    
    const obj = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        walletAddress: walletAddress,
        walletPvtAddress: walletPvtAddress
    }

    const result = validateNewUser(obj)
    console.log(result)
    if(result.status){
        res.status(400).json({status:"Failed" , message: result.message })
        return; 
    }


    let response = await registerUser(email, username, password, confirmPassword, walletAddress, walletPvtAddress, adminPass)
    // console.log("controller signup response : ",response)
    res.status(response.statuscode).json(response)
}

export { signinControl, signupController }
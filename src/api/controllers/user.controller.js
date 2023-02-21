import { getUser, registerUser } from "../services/user.service.js"


async function signinControl(req, res){
    // console.log("params ",req.params)
    // console.log("body ",req.body)
   // getting the email
   let username = req.params.username

   // getting password
   let password = req.body.password
   try {
       let response = await getUser(username, password)
       console.log("controller signin response received : ",response)
       res.send(response)
    //    return
   } catch(err){
    console.log("error signin ",err)
   } 
}

async function signupController(req,res){
    let username = req.params.username
    let email = req.body.email;
    let password = req.body.password
    let confirmPassword = req.body.confirmPassword
    try {
        let response = await registerUser(email, username, password, confirmPassword)
        console.log("controller signup response : ",response)
        res.send(response)
    } catch(err){
        console.log("error signup ",err)
    }
}

export { signinControl, signupController }
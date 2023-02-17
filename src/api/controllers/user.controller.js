import { getUser, registerUser } from "../services/user.service.js"


async function signinControl(req, res){
   // getting the username
   let user = req.params.name

   // getting password
   let password = req.body.password
   try {
       let response = await getUser(user, password)
       console.log("controller signin response received : ",response)
       res.send(response)
    //    return
   } catch(err){
    console.log("error signin ",err)
   } 
}

async function signupController(req,res){
    let name = req.params.name;
    let password = req.body.password
    let confirmPassword = req.body.confirmPassword
    // if(password === confirmPassword){
    //     res.send("Invalid password").statusCode(400)
    //     return
    // }
    try {
        let response = await registerUser(name,password, confirmPassword)
        console.log("controller signup response : ",response)
        res.send(response)
    } catch(err){
        console.log("error signup ",err)
    }
}

export { signinControl, signupController }
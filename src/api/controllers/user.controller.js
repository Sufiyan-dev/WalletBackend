import { getUser, optinAsset, registerUser } from "../services/user.service.js"
import { handleError, handleResponse } from "../utils/responseHelper.js"
import {validateNewUser, validateExistingUser} from "../validation/userValidation.js"


async function signinControl(req, res){
   // getting the email
   let username = req.params.username

   // getting password
   let password = req.body.password

   const obj = {
    username: username,
    password: password
   }

   try {

        const result = validateExistingUser(obj);

        if(result.status){ // validation error
            throw new TypeError(result.message, 500);
        }

        let response = await getUser(username, password)

        if(!response.status){ // error
            throw new TypeError(response.message,500)
        }

        handleResponse({res,statusCode: 201, result: response.message})
        // res.status(response.statuscode).json(resp1onse) 

   } catch(err){
        if (err instanceof TypeError) {
        handleError({ res, statusCode: 400, err: err });
        } else {
        // internal error
        handleError({ res, statusCode: 500, err: err });
        }
   }
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

    try {
        const result = validateNewUser(obj);

        if (result.status) {
            
          throw new TypeError(result.message);
          // res.status(400).json({status:"Failed" , message: result.message })
        }

        let response = await registerUser(
          email,
          username,
          password,
          confirmPassword,
          walletAddress,
          walletPvtAddress,
          adminPass
        );

        if(!response.status){
            throw new TypeError(response.message);
        }

        handleResponse({res, statusCode: 201, msg: response})
        
        // res.status(response.statuscode).json(response);
    } catch(err){
        if(err instanceof TypeError){
            handleError({res, statusCode: 400, err: err})
        } else { // internal error
            handleError({res, statusCode: 500, err: err })
        }
    }
}

const optinController = async (req,res) => {
    let { assetAddress , assetType } = req.body
    let token = req.jwtToken

    try {
        const response = await optinAsset(
          assetAddress,
          assetType,
          token.username
        );

        if (!response.status) {
            throw new TypeError(response.message);
        }

        handleResponse({res, statusCode: 201, msg: response.message})

    } catch(err) {
        if(err instanceof TypeError){
            handleError({res, statusCode: 400, err: err})
        } else { // internal error
            handleError({res, statusCode: 500, err: err })
        }
    }

    // res.status(response.statuscode).json(response);
}

export { signinControl, signupController, optinController }
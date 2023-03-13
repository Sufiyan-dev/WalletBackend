import { confirmOtp, sendOtp } from '../services/otp.service.js';
import { handleError, handleResponse } from '../utils/responseHelper.js';
import { validateConfirmOtp, validateGenerateOtp } from '../validation/otpValidation.js';


const generateOtpForUser = async (req,res) => {

    // validating jwt
    const token = req.jwtToken;

    // getting the username 
    const username = token.username;

    try {

        // validation here 
        const resp = validateGenerateOtp({username: username});

        if(resp.status){
            throw new TypeError(resp.message);
        }
    
        // calling service 
        let result = await sendOtp(username, token);

        if(!result.status){
            throw new TypeError(result.message);
        }

        // sending the result back
        handleResponse({res, statusCode: 201, result: result});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {
            // internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

const verifyOtpOfUser = async (req,res) => {
    
    const token = req.jwtToken;

    // getting the data
    const username = token.username;
    const otp = req.body.otp;

    try {
        // validation here 
        const resp = validateConfirmOtp({username: username, otp: otp});
        if(resp.status){
            throw new TypeError(result.message);
        }

        // calling the service
        const result = await confirmOtp(username,token,otp);

        if(!result.status){
            throw new TypeError(result.message);
        }

        // sending the resposne back
        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

export { generateOtpForUser, verifyOtpOfUser};
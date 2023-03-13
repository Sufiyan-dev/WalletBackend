import { jwtVerify } from '../utils/jwtToken.js';
import { handleError, handleUnAuthorized } from '../utils/responseHelper.js';

const verifyUser = (req,res,next) => {
    
    const ignoreRoutes = [
        'signin',
        'signup',
        'check'
    ];

    const pathWithoutParams = req.path.split('/')[1];
    
    if(ignoreRoutes.includes(pathWithoutParams)){
        next();
        return;
    }
    
    const token = req.headers.authorization;

    const data = jwtVerify(token);

    if(!data.status){
        if(data.message == 'jwt expired'){
            handleError({res, statusCode: 440, err: data}); // token expired 
        } else {
            handleUnAuthorized({res, err: data}); // invalid token
        }
    }else {
        // console.log("verified")
        req.jwtToken = data.message;
        next();
    }


};

export default verifyUser;
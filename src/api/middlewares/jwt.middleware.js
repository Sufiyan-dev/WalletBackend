import { jwtVerify } from "../utils/jwtToken.js"

const verifyUser = (req,res,next) => {
    
    const ignoreRoutes = [
        "signin",
        "signup"
    ]
    
    // console.log("PATH", req.method)

    const pathWithoutParams = req.path.split("/")[1]
    console.log(pathWithoutParams)
    
    if(ignoreRoutes.includes(pathWithoutParams) /*|| req.method == "GET"*/){
        console.log("path included");
        next();
        return;
    }
    
    const token = req.headers.authorization;
    console.log("token", token)

    const data = jwtVerify(token)

    if(!data.status){
         if(data.message == 'jwt expired'){
            res.status(440).json({status: "Failed", message: "jwt token expired"}) // token expired
        } else {
            res.status(498).json({status: "Failed", message: "invalid jwt token"}) // invalid token
        }
    }else {
        console.log("verified")
        req.jwtToken = data.message
        next();
    }


}

export default verifyUser
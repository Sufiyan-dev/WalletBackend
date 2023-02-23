import { jwtVerify } from "../utils/jwtToken.js"

const verifyUser = (req,res,next) => {
    
    const ignoreRoutes = [
        "signin",
        "signup"
    ]
    
    // console.log("PATH", req.method)

    const pathWithoutParams = req.path.split("/")[1]
    console.log(pathWithoutParams)
    
    // if(ignoreRoutes.includes(req.path) || req.method == "GET"){
    //     console.log("path included");
    //     next();
    // }
    
    const token = req.getHeader('authorization')
    console.log("token", token)



    const data = jwtVerify(token)

    if(!data.status){
        if(data.message == 'jwt expired'){
            res.status(440).json({"message":'Session expired please relogin'})
        } else {
            res.status(498).send('Invalid credentials');
        }
    }

    console.log("verified")
    next();

}

export default verifyUser
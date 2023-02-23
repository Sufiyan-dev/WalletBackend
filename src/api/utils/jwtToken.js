import dotenv from 'dotenv'
import JWT from 'jsonwebtoken'

dotenv.config()

const jsonSecret = process.env.JWT_SECRET_KEY

const jwtGenerate = (data) => {
    const token = JWT.sign(data,jsonSecret,{expiresIn: 100})

    console.log("token ", token)

    return token
}

const jwtVerify = (token) => {
    try {
        const verify = JWT.verify(token,jsonSecret);
        console.log(verify)
        return {"status": true, "message": verify}
    } catch(err){
        console.log("jwt error :",err.message)
        return {"status": false, "message": err.message}
    }

}

// jwtSigxnData({"hey": "hello"})


export {jwtGenerate, jwtVerify}
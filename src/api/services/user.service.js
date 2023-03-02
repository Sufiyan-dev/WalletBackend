import dotenv from 'dotenv'
import db from "../../config/db.config.js"
import walletModel from "../models/wallet.model.js"
import { generateAddress } from "../utils/createAddress.js"
import { checkPassword, generateHashFromPassword } from "../utils/hashPassword.js"
import { jwtGenerate } from "../utils/jwtToken.js"
import { encrypt } from '../utils/SymEncrpyt.js'

dotenv.config()

async function getUser(username, password){
    try{
        console.log(password,typeof(password))
        // getting the user from db
        let userInfo = await walletModel.findOne({username: username})
        console.log("user ", userInfo)

        // if not then throw error
        if(!userInfo){
            return {
                status: "Failed",
                statuscode: 400,
                message: "invalid user"
            }
        }

        // getting the hash of password
        let hash = userInfo.password

        // checking if the password is valid
        let check = await checkPassword(password,hash);
        console.log(check)

        if(!check){
            return {
                status: "Failed",
                statuscode: 400,
                message: "invalid password"
            }
        }

        const obj = {
            "username": userInfo.username,
            "email": userInfo.email,
            "verified": userInfo.verified,
            "isAdmin": userInfo.isAdmin
        }

        const token = jwtGenerate(obj)

        return {
            status: "Success",
            statuscode: 201,
            message: { user: userInfo, token: token}
        }

    } catch(err){
        console.log("error hash ",err)
        return { 
            status: "Failed error",
            statuscode: 500,
            message: err.message
        }
    }
}

async function registerUser(email, username, password, confirmPassword, address, pvtKey, adminPass){
    let  adminAccess = false
    try {
        // if (password === confirmPassword) {

            if(adminPass){ // checking if admin exist
                if(adminPass != process.env.ADMIN_PASS){ // cheking valid admin pass
                    return {status: "Failed",statuscode: 400, message: "Invalid admin password"}
                }else {
                    adminAccess = true
                }
            }

            // checking if mail already exist 
            let isEmailExist = await walletModel.exists({email: email})
            let isUsernameExist = await walletModel.exists({username:username})
            console.log(isEmailExist,isUsernameExist)

            // validation
            if(isEmailExist || isUsernameExist){
                return {
                    status: "Failed",
                    statuscode: 400,
                    message: "User already exist"
                }
            }

            // generating hash from password
            let hash = await generateHashFromPassword(password);

            // checking if any error
            if (!hash) {
                return {status: "Failed", statuscode: 500, message: "encrypting password failed"}
            }

            let adddressInfo
            if(!address && !pvtKey){
                adddressInfo = generateAddress();

            }else{
                adddressInfo = {"address": address, "privateKey": pvtKey}
            }

            const encryptedData = encrypt(adddressInfo.address,adddressInfo.privateKey)

            // generating new address for user
           
            // storing the user
            let data = await walletModel.create({
                email: email,
                password: hash,
                username: username,
                verified: false,
                isAdmin: adminAccess,
                walletInfo: {
                    publicKey: adddressInfo.address,
                    privateKey: encryptedData,
                }    
            })

            // returing the user info
            return {
                status: "Success",
                statuscode: 201,
                message: data
            }
        // } else {
        //     return {
        //         status: "Failed",

        //         message: "invalid password match"
        //     }
        // }
    } catch (err) {
        // console.log("error register user ", err)
        return {
            status: "Failed catch",
            statuscode: 500,
            message: err.message
        }
    }
}




export { getUser, registerUser }
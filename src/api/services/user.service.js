import db from "../../config/db.config.js"
import walletModel from "../models/wallet.model.js"
import { checkPassword, generateHashFromPassword } from "../utils/encryptNdecrypt.js"

async function getUser(name, password){
    try{
        console.log(typeof(password))
        let userinfo = await walletModel.find({username: name})
        if(!userinfo){
            return "could'nt find the user"
        }
        let userInfo = userinfo[0]

        let hash = userInfo.password

        let check = await checkPassword(password,hash);

        console.log(check)
        if(!check){
            return "invalid password"
        }

        return userInfo
    } catch(err){
        console.log("error hash ",err)
        return err
    }
}

async function registerUser(name, password, confirmPassword){
    try {
        if (password === confirmPassword) {
            // generating hash from password
            let hash = await generateHashFromPassword(password);

            // checking if any error
            if (!hash) {
                return "encrypting password failed"
            }

            // storing the user
            let data = await walletModel.create({
                username: name,
                password: hash
            })

            // returing the user info
            return data
        } else {
            return "invalid password match"
        }
    } catch (err) {
        console.log("error register user ", err)
        return err
    }
}




export { getUser, registerUser }
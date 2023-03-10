import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config()


const saltRounds = Number(process.env.saltRounds)

const generateHashFromPassword = async (password) => {
    console.log("salt ",typeof(saltRounds))
    
    let salt = await bcrypt.genSalt(saltRounds);
    console.log("salt ", salt)
    let hash = await bcrypt.hash(password,salt);
    console.log("hash ", hash)
    return hash
    
}

const checkPassword = async (password, passHash) => {
    let isMatched = await bcrypt.compare(password,passHash)
   
    // console.log(isMatched)
    return isMatched
}

export {generateHashFromPassword, checkPassword}
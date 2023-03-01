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
    
    // bcrypt.genSalt(saltRounds, (saltError, salt) => {
    //     if(saltError) throw saltError
    //     callba
    //     bcrypt.hash(password, salt, (hashError, hash) => {
    //         if(hashError) throw hashError

    //         console.log(hash)
    //         return hash
    //     })
    // })
}

const checkPassword = async (password, passHash) => {
    let isMatched = await bcrypt.compare(password,passHash)
   
    // console.log(isMatched)
    return isMatched
}


// const password = "123"
// const hash = "$2a$10$Zb5GmlgLZHaRV1FebcDhjOvVI4DjN35NIt0nxfmP.mHe0SLHqMmba"
// generateHashFromPassword(password)
// checkPassword(password,hash).then((resut) => {
//     console.log(resut)
// })

export {generateHashFromPassword, checkPassword}
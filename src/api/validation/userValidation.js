import Joi from "joi";

const newUserSchema  = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirmPassword: Joi.ref('password'),
    walletAddress: Joi.string().length(42),
    walletPvtAddress: Joi.string().length(64)
})

const existUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
})

const validateNewUser = (userDataObj) => {
    const data = newUserSchema.validate(userDataObj)
    console.log("valdate output ",data)

    if(data.error){
        return { status: data.error.isJoi, message: data.error.message}
    } else {
        return { status: false, message: "pass"}
    }
    // console.log(data.error.message, data.error.isJoi)
    
}

const validateExistingUser = (userDataObj) => {
    const data = existUserSchema.validate(userDataObj);

    if(data.error){
        // console.log(data)
        return {status: data.error.isJoi, message: data.error.message}
    } else {
        return { status: false, message: "pass"}
    }
}



export { validateNewUser, validateExistingUser } 
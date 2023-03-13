import Joi from 'joi';
import logger from '../logger/index.js';

const transferTokenSchema = Joi.object({
    user: Joi.string().alphanum().min(3).max(30).required(),
    contractAddress: Joi.string().length(42).required(),
    amount: Joi.number().min(1).max(10000).required(),
    to: Joi.string().alphanum().min(3).max(30).required()
});

const balanceCheckSchema = Joi.object({
    address: Joi.string().length(42).required(),
    contractAddress: Joi.string().length(42).required()
});

const getTxnOfUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    noOfTxns: Joi.number().min(1).max(20).required()
}); 

const getTxnOfAllSchema = Joi.object({
    noOfTxns: Joi.number().min(1).max(20).required()
});


const validateTransferTokenTxn = (obj) => {
    const data = transferTokenSchema.validate(obj);
    logger.silly('valdate output ',data);

    if(data.error){
        return { status: data.error.isJoi, message: data.error.message};
    } else {
        return { status: false, message: 'pass'};
    }
};

const validateBalanceCheck = (obj) => {
    const data = balanceCheckSchema.validate(obj);
    logger.silly('valdate output ',data);

    if(data.error){
        return { status: data.error.isJoi, message: data.error.message};
    } else {
        return { status: false, message: 'pass'};
    }
};

const validateGetTxnOfUser = (obj) => {
    const data = getTxnOfUserSchema.validate(obj);
    logger.silly('valdate output ',data);

    if(data.error){
        return { status: data.error.isJoi, message: data.error.message};
    } else {
        return { status: false, message: 'pass'};
    }
};

const validateGetTxnOfAll = (obj) => {
    const data = getTxnOfAllSchema.validate(obj);
    logger.silly('valdate output ',data);

    if(data.error){
        return { status: data.error.isJoi, message: data.error.message};
    } else {
        return { status: false, message: 'pass'};
    }
};


export { validateTransferTokenTxn, validateBalanceCheck, validateGetTxnOfUser, validateGetTxnOfAll};
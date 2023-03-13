import { transferERC20, checkBalanceOfUser, getTransactionOfSpecificUser, getTransactionOfAllUser, transferETH } from '../services/transaction.service.js';
import { handleError, handleResponse } from '../utils/responseHelper.js';
import { validateGetTxnOfAll, validateGetTxnOfUser, validateTransferTokenTxn, validateBalanceCheck } from '../validation/txnValidation.js';


const tokenTransfer = async (req,res) => {
    const {contractAddress, amount, to} = req.body;

    const token = req.jwtToken;

    const user = token.username;

    // obj 
    const obj = {
        user: user,
        contractAddress: contractAddress,
        amount: amount,
        to: to
    };

    try {

        const resp = validateTransferTokenTxn(obj);

        if(resp.status){
            throw new TypeError(resp.message);
        }

        const result = await transferERC20(user, contractAddress, amount, to);

        if(!result.status){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

const ethTransfer = async (req,res) => {
    const { to, amount} = req.body;
    const token = req.jwtToken;

    try {

        const result = await transferETH(token.username, to, amount);

        if(!result.status){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }

};

const balanceCheck = async (req,res) => {
    const { address, contractAddress} = req.body;

    // obj
    const obj = {
        address: address,
        contractAddress: contractAddress
    };

    try {

        const resp = validateBalanceCheck(obj);

        if(resp.status){
            throw new TypeError(resp.message);
        }
    
        const result = await checkBalanceOfUser(address,contractAddress);

        if(!result.status){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

const getTransactionOfUser = async (req,res) => {
    
    const noOfTxns = req.params.txns;
    const skipNoOfTxns = req.params.skip;
    const token = req.jwtToken;
    const username = token.username;

    const obj = {
        username: username,
        noOfTxns: noOfTxns
    };

    try {

        const resp = validateGetTxnOfUser(obj);

        if(resp.status){
            throw new TypeError(resp.message);
        }
    
        const result = await getTransactionOfSpecificUser(username, noOfTxns, skipNoOfTxns, token);

        if(!result.status){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {  // internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

const getTransactionOfAll = async (req,res) => {
    const noOfTxns = req.params.txns;
    const skipNoOfTxns = req.params.skip;
    const token = req.jwtToken;

    const obj = {
        noOfTxns: noOfTxns
    };

    try {

        const resp = validateGetTxnOfAll(obj);

        if(resp.status){
            throw new TypeError(resp.message);
        }

        const result = await getTransactionOfAllUser(noOfTxns, skipNoOfTxns, token);
        
        if(!result.status){
            throw new TypeError(result.message);
        }

        handleResponse({res,statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err });
        } else {  // internal error
            handleError({ res, statusCode: 500, err: err });
        }
    }
};

export { ethTransfer, tokenTransfer, balanceCheck, getTransactionOfUser, getTransactionOfAll };
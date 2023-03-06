import { ethers } from "ethers";

import dotenv from 'dotenv'

// import { data as erc20ABI } from "./abi/erc20.js" ;
import { BigNumber } from "@ethersproject/bignumber";

dotenv.config()

const AppTokenAddress = '0xd8E3f15A14164CCcc70efc24570b0Cd0b256cDe7';

let currentAccount;

const erc20ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function mint(uint amount) external returns(bool)",
    "function name() external view returns (string memory)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string memory)"
]



/**
 * 
 * @param {string} pvKey of account
 * @param {string} type 'read' or 'readwrite' type of instance needed
 * @returns signer instance
 */
async function init(pvKey,type){

    let signer
    const apiKey = `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`
    if(type == "read"){
        signer = new ethers.JsonRpcProvider(apiKey);
    } 
    else {
        let provider = new ethers.JsonRpcProvider(apiKey);
        signer =  new ethers.Wallet(pvKey, provider);
    } 

    // updating 
    currentAccount = signer.address

    console.log("Using address ", currentAccount)

    return signer
}

async function getContractInstance(address, abi, signer){
    
    const ContractInstance = new ethers.Contract(address, abi, signer);

    return ContractInstance
}

async function sendTransaction(TokenAmount){

}

/**
 * 
 * @param {string} address 
 * @param {string} contractAddress 
 * @param { erc20 || erc721 || weth || abiOfThatContract } contractType 
 * @param {number} amount 
 */
async function sendToken(fromPvKey,to, contractAddress, contractType, amount){

    try {
        let signer;
        // creating the instance to use that address in web3
        if(!fromPvKey){
            
            signer = await init(process.env.APP_PVT_KEY,"readwrite")
        } else {
            signer = await init(fromPvKey,"readwrite")
        }

        console.log("singer : ",signer.address);

        let contractInstance, contract

        // checking the type of contract 
        if (contractType == 'erc20') { // if erc20 contract 

            // getting contract instance 
            contractInstance = await getContractInstance(contractAddress, erc20ABI, signer)

        } 

        // getting the name of contract
        let name = await contractInstance.name()
        console.log("name of contract ", name);

        // getting the balance of current user
        let balance = Number(await contractInstance.balanceOf(currentAccount))
        console.log(`Balance of ${currentAccount} is ${balance / 10**18}`)

        // checking if balance is less than amount
        let balanceFinal = balance / 10**18
        // console.log("Balance is ",balanceFinal," Amount is ",amount,balanceFinal < amount ? true : false)
        if( balanceFinal < amount){
            if(contractAddress == AppTokenAddress){
                console.log("Insufficent funds minting fresh ones")
                let ammountToMint = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
                // minting new token 
                let mintTokenTxn = await contractInstance.mint(ammountToMint);
                console.log("mint txn ", mintTokenTxn.transactionHash)
            } else {
                console.log("Insufficent balance in user")
                return false
            }    
        }

        let fixAmountToSend = BigNumber.from(amount).mul(BigNumber.from(10).pow(18)).toString()

        console.log(`Transfering ${amount} tokens to ${to}`)

        // let estimateGas = await contractInstance.estimateGas.transfer(to,fixAmountToSend);
        // console.log("gas estimate ", estimateGas);
        // transfering token 
        let transferTxn = await contractInstance.transfer(to,fixAmountToSend);
        console.log("transfer txn hash : ",transferTxn.hash)

        return {"txHash": transferTxn.hash}
    } catch (err) {
        console.log("error send token : ", err)
        return false
    }
}

const getBalanceAndDecimal = async (contractAddress,address) => {

    try{

        const signer = await init(process.env.APP_PVT_KEY,"read")

        const contract = await getContractInstance(contractAddress, erc20ABI, signer);

        // contract.connect(signer)

        const balance = await contract.balanceOf(address);
        console.log("balance is ", balance)
        const decimals = await contract.decimals();
        console.log("decimals ", decimals);
        const symbol = await contract.symbol();
        console.log("symbol ",symbol)

        return {"balance": Number(balance),"decimals": Number(decimals), "symbol": Number(symbol)}

    } catch(err){
        console.log("error getBalance : ",err.message)
        return false
    }
}

const getEthBalance = async(address) => {

    try {
        
        const signer = await init(process.env.APP_PVT_KEY, "read")

        const balance = await signer.getBalance(address)
        const finalAmount = Number(balance) / 10 ** 18

        return finalAmount

    } catch(err){
        console.log("get eth balance error ", err.message)
        return false
    }
}


const waitForTxnToMint = async (txHash) => {
    const provider = await init(0,"read");

    const txn = await provider.waitForTransaction(txHash);
    console.log("tx confiremd ",txn.hash);
    if(txn){
        return true
    } 
    return false
}








export { sendToken, AppTokenAddress, getBalanceAndDecimal, getEthBalance, waitForTxnToMint }

// 
// sendToken('0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D',AppTokenAddress,'erc20',10);
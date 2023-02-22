import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import dotenv from 'dotenv'

import { data as erc20ABI } from "./abi/erc20.js" ;
import { BigNumber } from "@ethersproject/bignumber";

dotenv.config()

const AppTokenAddress = '0xd8E3f15A14164CCcc70efc24570b0Cd0b256cDe7';

let currentAccount;
// const pvKey = process.env.APP_PVT_KEY

// const localKeyProvider = new HDWalletProvider({
//     privateKeys: [pvKey],
//     providerOrUrl: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`,
// });

// const web3 = new Web3(localKeyProvider);

// const myAccount = web3.eth.accounts.privateKeyToAccount(pvKey);
// console.log("Using address ", myAccount.address)

// const ContractInstance = new web3.eth.Contract(erc20ABI,AppTokenAddress);
// let name = await ContractInstance.methods.name.call()
// console.log(name)


async function init(pvKey){

    const localKeyProvider = new HDWalletProvider({
        privateKeys: [pvKey],
        providerOrUrl: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`,
    });

    const web3 = new Web3(localKeyProvider);

    const myAccount = web3.eth.accounts.privateKeyToAccount(pvKey);
    // updating 
    currentAccount = myAccount.address

    console.log("Using address ", myAccount.address)

    return web3
}

async function getContractInstance(address, abi, web3Instance){
    let web3 = web3Instance
    const ContractInstance = new web3.eth.Contract(abi,address)

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
        let web3;
        // creating the instance to use that address in web3
        if(!fromPvKey){
            
            web3 = await init(process.env.APP_PVT_KEY)
        } else {
            web3 = await init(fromPvKey)
        }


        let contractInstance

        // checking the type of contract 
        if (contractType == 'erc20') { // if erc20 contract 

            // getting contract instance 
            contractInstance = await getContractInstance(contractAddress, erc20ABI, web3)

        } 
        // else if (contractType == 'erc721') { // if and nft contract

        //     // getting contract instance 
        //     // contractInstance = await getContractInstance(contractAddress, , web3)

        // } else if (contractType == 'weth') { //  if weth contract 

        //     // getting contract instance 
        //     // contractInstance = await getContractInstance(contractAddress, , web3)

        // } else { // if not the above one then user must pass object in params 

        //     // getting contract instance 
        //     contractInstance = await getContractInstance(contractAddress, contractType, web3)
        // }

        // getting the name of contract
        let name = await contractInstance.methods.name().call()
        console.log("name of contract ", name);

        // getting the balance of current user
        let balance = await contractInstance.methods.balanceOf(currentAccount).call()
        console.log(`Balance of ${currentAccount} is ${balance / 10**18}`)

        // checking if balance is less than amount
        let balanceFinal = balance / 10**18
        console.log("Balance is ",balanceFinal," Amount is ",amount,balanceFinal < amount ? true : false)
        if( balanceFinal < amount){

            if(contractAddress == AppTokenAddress){
                console.log("Insufficent funds minting fresh ones")
                let ammountToMint = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
                // minting new token 
                let mintTokenTxn = await contractInstance.methods.mint(ammountToMint).send({ from: currentAccount });
                console.log("mint txn ", mintTokenTxn.transactionHash)
            } else {
                console.log("Insufficent balance in user")
                return false
            }
            
        }

        let fixAmountToSend = BigNumber.from(amount).mul(BigNumber.from(10).pow(18))

        console.log(`Transfering ${amount} tokens to ${to}`)
        // transfering token 
        let transferTxn = await contractInstance.methods.transfer(to,fixAmountToSend).send({from: currentAccount});
        console.log("transfer txn hash : ",transferTxn.transactionHash)

        return {"txHash": transferTxn.transactionHash}
    } catch (err) {
        console.log("error send token : ", err)
        return false
    }
}

const getBalanceAndDecimal = async (contractAddress,address) => {

    try{

        //
        const web3 = await init(process.env.APP_PVT_KEY)

        // 
        const contract = await getContractInstance(contractAddress, erc20ABI,web3);

        // 
        const balance = await contract.methods.balanceOf(address).call()

        const decimals = await contract.methods.decimals().call()

        const symbol = await contract.methods.symbol().call();

        console.log("balance ",balance," decimals ",decimals)

        return {"balance": balance,"decimals": decimals, "symbol": symbol}

    } catch(err){
        console.log("error getBalance : ",err.message)
        return false
    }
}

const getEthBalance = async(address) => {

    try {

        const web3 = await init(process.env.APP_PVT_KEY)

        const balance = await web3.eth.getBalance(address)

        const finalAmount = balance / 10 ** 18

        return finalAmount

    } catch(err){
        console.log("get eth balance error ", err.message)
        return false
    }
}








export { sendToken, AppTokenAddress, getBalanceAndDecimal, getEthBalance }

// 
// sendToken('0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D',AppTokenAddress,'erc20',10);
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
async function sendToken(address, contractAddress, contractType, amount){

    try {

        // creating the instance to use that address in web3
        const web3 = await init(process.env.APP_PVT_KEY)


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
            console.log("Insuffieicent funds minting fresh ones")
            let ammountToMint = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
            // minting new token 
            let mintTokenTxn = await contractInstance.methods.mint(ammountToMint).send({from: currentAccount});
            console.log("mint txn ",mintTokenTxn.transactionHash)
        }

        let fixAmountToSend = BigNumber.from(amount).mul(BigNumber.from(10).pow(18))

        console.log(`Transfering ${amount} tokens to ${address}`)
        // transfering token 
        let transferTxn = await contractInstance.methods.transfer(address,fixAmountToSend).send({from: currentAccount});
        console.log("transfer txn hash : ",transferTxn.transactionHash)

        return true
    } catch (err) {
        console.log("error send token : ", err)
        return false
    }
}








export { sendToken, AppTokenAddress }

// 
// sendToken('0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D',AppTokenAddress,'erc20',10);
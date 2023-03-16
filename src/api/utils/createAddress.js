import web3 from 'web3';
import { ethers } from 'ethers';

const Web3 = new web3();

const createAddress = () => {

    const wallet = ethers.Wallet.createRandom();

    return wallet;
};


const generateAddress = () => {

    let data = Web3.eth.accounts.create();

    return data;
};

export { createAddress , generateAddress };
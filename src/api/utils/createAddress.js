import web3 from 'web3';

const Web3 = new web3();


export function generateAddress() {

    let data = Web3.eth.accounts.create();

    return data;
}
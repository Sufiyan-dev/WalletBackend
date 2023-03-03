import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config()

/**
 * provider.once(txHash, (transaction) => {
    // Emitted when the transaction has been mined
})
 */
// const network = "goerli"
// const provider = ethers.getDefaultProvider(network,{
    
// })

const provider = new ethers.JsonRpcProvider(`https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`);


const signer = new ethers.Wallet(process.env.APP_PVT_KEY,`https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMYKEYGOERLI}`)

// const listenToTxn = (txHash) => {
//     AnkrProvider
// }

const balance = await provider.getBalance(signer.address)

console.log(ethers.formatEther(balance))
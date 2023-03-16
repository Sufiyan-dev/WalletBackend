// const axios = require('axios');
import axios from 'axios';
import logger from '../logger/index.js';
const uniswapURL = 'https://api.studio.thegraph.com/query/43306/gld-token-wallet-app/v0.0.1'; // https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
let minBlockV = 0;
const query = `
query GetProtocol($minBlock: Int!) {
    tokenTransfers(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        to
        value
        transactionHash
        blockNumber
        blockTimestamp
      }
    _meta {
        block {
            number
        }
    }
}`;

// eslint-disable-next-line no-unused-vars
const query2 = `
{
   tokenTransfers(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
    id
    from
    to
    value
    transactionHash
    blockNumber
    blockTimestamp
  }
} 
`;

// eslint-disable-next-line no-unused-vars
const queryGetBlock = `
{
    _meta {
        block {
            number
        }
    }
}
`;


const main = async (txHash) =>{
    try {
        const result = await axios.post(
            uniswapURL,
            {
                query:query,
                variables: {minBlock: minBlockV}
            }
        );           
        logger.info(`Query result: \n  ${JSON.stringify(result.data.data.tokenTransfers)}`);
        let res = finder(result.data.data.tokenTransfers,txHash);
        return res;
    } catch (err){
        logger.info(`querying error : ${err.message}`);
        return false;
    }

};

/// Updates the protocol.paused variable to the latest
/// known value in a loop by fetching it using The Graph.
const queryWaiter = async(txHash) => {
    try {
        // It's ok to start with minBlock at 0. The query will be served
        // using the latest block available. Setting minBlock to 0 is the
        // same as leaving out that argument.
        let minBlock = 0;
  
        for (;;) {
        // Schedule a promise that will be ready once
        // the next Ethereum block will likely be available.
            const nextBlock = new Promise((f) => {
                setTimeout(f, 14000);
            });
  
            const query = `
                query GetProtocol($minBlock: Int!) {
                    tokenTransfers(block: { number_gte: $minBlock }, first: 5, orderBy: blockTimestamp, orderDirection: desc) {
                        id
                        from
                        to
                        value
                        transactionHash
                        blockNumber
                        blockTimestamp
                    }
                    _meta {
                        block {
                            number
                        }
                    }
                }`;
  
            // const variables = { minBlock }
            const response = await axios.post(
                uniswapURL,
                {
                    query:query,
                    variables: {minBlock: minBlock}
                }
            );  
            minBlock = response.data.data._meta.block.number;
  
            // doing with result 
            logger.info(`data recived  : ${JSON.stringify(response.data.data.tokenTransfers)}`);
            const result = finder(response.data.data.tokenTransfers, txHash);

            // return if found the hash
            if(result.Exist){
                return result;
            }
            // Sleep to wait for the next block
            await nextBlock;
        }
    } catch(err){
        logger.error(`queryDataFromSubgraphError : ${err.message}`);
        return false;
    }
};

const finder = (arrayOfTxn, txHashToFind) => {
    let Exist = {'Exist': false, 'index': null};
    for(let i in arrayOfTxn){
        if(arrayOfTxn[i].transactionHash === txHashToFind){
            Exist = {'Exist': true, 'index': i};
        }
    }
    logger.info(`finder ${JSON.stringify(Exist)}`);
    return Exist;
};

export { queryWaiter, main };
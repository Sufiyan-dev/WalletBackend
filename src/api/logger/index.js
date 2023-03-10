import dotenv from 'dotenv';

import buildProdLogger from "./prodLogger";
import buildDevLogger from "./devLogger";

dotenv.config();


let logger = null;
if(process.env.NODE_ENV == "dev"){ // development mode
    logger = buildDevLogger()
} else { // production mode 
    logger = buildProdLogger()
}


export default logger;

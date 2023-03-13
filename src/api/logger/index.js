/* eslint-disable no-undef */
import dotenv from 'dotenv';

import buildProdLogger from './prodLogger.js';
import buildDevLogger from './devLogger.js';

dotenv.config();

let logger = null;
if (process.env.NODE_ENV == 'dev') {
    // development mode
    logger = buildDevLogger();
} else {
    // production mode
    logger = buildProdLogger();
}

export default logger;

import crypto from 'crypto';
import buffer from 'buffer';

import logger from '../logger/index.js';

const Buffer = buffer.Buffer;
const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';
const ivlength = 16;  // AES blocksize


const encrypt = (secret, text) => {
    try {
        // key must be 32 bytes for aes256
        const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0,32); 
        const iv = crypto.randomBytes(ivlength);

        logger.silly('Encrypting : ',text);

        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let ciphered = cipher.update(text, inputEncoding, outputEncoding);
        ciphered += cipher.final(outputEncoding);
        let ciphertext = iv.toString(outputEncoding) + ':' + ciphered;

        logger.silly(`Result in ${outputEncoding} is ${ciphertext}`);

        return ciphertext;
    } catch(err){
        logger.error('encrypt private key error : ', err.message);
        return false;
    }
};

const decrypt = (encryptedData, secret) => {
    try {
        const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0,32);

        let components = encryptedData.split(':');
        const iv_from_ciphertext = Buffer.from(components.shift(), outputEncoding);
        let decipher = crypto.createDecipheriv(algorithm, key, iv_from_ciphertext);
        let deciphered = decipher.update(components.join(':'), outputEncoding, inputEncoding);
        deciphered += decipher.final(inputEncoding);

        logger.silly('Decrypted data : ',deciphered);

        return deciphered;
    } catch(err){
        logger.error('decrypt private key error : ',err.message);
        return false;
    }
};

// TEST //
// const data = '8380ff55e0655d9f6fba4d88d010fdb3b7e1b363463f5149474cd98b9b912887'
// const encryptedData = encrypt('0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D',data);
// const decreptedData = decrypt(encryptedData,'0xC9DDd4a9640DE6a774A231F5862c922AC6cb394D');
// data === decreptedData ? logger.debug(true): logger.debug(false)


export { encrypt, decrypt};
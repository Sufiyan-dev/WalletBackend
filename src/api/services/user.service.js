import dotenv from 'dotenv';
import walletModel from '../models/wallet.model.js';
import { generateAddress } from '../utils/createAddress.js';
import { checkPassword, generateHashFromPassword } from '../utils/hashPassword.js';
import { jwtGenerate } from '../utils/jwtToken.js';
import { assetOptinCheckerAndIndexerFinder } from '../utils/optinChecker.js';
import { encrypt } from '../utils/SymEncrpyt.js';
import { getBalanceAndDecimal } from '../utils/TransactionHelper.js';
import logger from '../logger/index.js';

dotenv.config();

async function getUser(username, password){
    try{

        // getting the user from db
        let userInfo = await walletModel.findOne({username: username});

        // if not then throw error
        if(!userInfo){
            return {
                status: false,
                message: 'invalid user'
            };
        }

        // getting the hash of password
        let hash = userInfo.password;

        // checking if the password is valid
        let check = await checkPassword(password,hash);

        if(!check){
            return {
                status: false,
                message: 'invalid password'
            };
        }

        const obj = {
            'username': userInfo.username,
            'email': userInfo.email,
            'verified': userInfo.verified,
            'isAdmin': userInfo.isAdmin
        };

        const token = jwtGenerate(obj);

        return {
            status: true,
            message: { user: userInfo, token: token}
        };

    } catch(err){
        logger.error(`get user error : ${err.message}`);
        return { 
            status: false,
            message: err.message
        };
    }
}

async function registerUser(email, username, password, confirmPassword, address, pvtKey, adminPass){
    let  adminAccess = false;
    try {

        if(adminPass){ // checking if admin exist
            // eslint-disable-next-line no-undef
            if(adminPass != process.env.ADMIN_PASS){ // cheking valid admin pass
                return {status: false, message: 'Invalid admin password'};
            }else {
                adminAccess = true;
            }
        }

        // checking if mail already exist 
        let isEmailExist = await walletModel.exists({email: email});
        let isUsernameExist = await walletModel.exists({username:username});

        logger.debug(`email exist : ${isEmailExist}  user exist : ${isUsernameExist}`);

        // validation
        if(isEmailExist || isUsernameExist){
            return {
                status: false,
                message: 'User already exist'
            };
        }

        // generating hash from password
        let hash = await generateHashFromPassword(password);

        // checking if any error
        if (!hash) {
            return {status: false, message: 'encrypting password failed'};
        }

        let adddressInfo;
        // generating new address for user
        if(!address && !pvtKey){
            adddressInfo = generateAddress();

        }else{
            adddressInfo = {'address': address, 'privateKey': pvtKey};
        }

        const encryptedData = encrypt(adddressInfo.address,adddressInfo.privateKey);
           
        // storing the user
        let data = await walletModel.create({
            email: email,
            password: hash,
            username: username,
            verified: false,
            isAdmin: adminAccess,
            walletInfo: {
                publicKey: adddressInfo.address,
                privateKey: encryptedData,
            }    
        });

        // returing the user info
        return {
            status: true,
            message: data
        };
    } catch (err) {
        logger.error(`register user error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
}

const optinAsset = async (assetAddress, assetType, username) => {

    try {

        const userData = await walletModel.findOne({ username: username });

        // never going to happen
        if (!userData) {
            return {
                status: false,
                message: 'User not found'
            };
        }

        if (assetType == 'erc20') {

            const assetInfoInUser = assetOptinCheckerAndIndexerFinder(userData.walletInfo.assetsOptin, assetAddress);
            if (assetInfoInUser.hasFound) {
                return {
                    status: true,
                    message: 'Asset already opted'
                };
            }

            // getting balance 
            const userBalanceInfo = await getBalanceAndDecimal(assetAddress, userData.walletInfo.publicKey);
            if (!userBalanceInfo) {
                return {
                    status: false,
                    message: 'getting balance failed'
                };
            }

            let balance = userBalanceInfo.balance / userBalanceInfo.decimals;

            userData.walletInfo.assetsOptin.push({
                address: assetAddress,
                assetType: assetType,
                lastBalance: balance
            });

        } else {
            return {
                status: true,
                message: 'App only allows erc20 token asset optin'
            };
        }

        userData.save();

        return {
            status: true,
            message: 'Optin successful'
        };

    } catch (err) {
        logger.error(`optin asset error : ${err.message}`);
        return {
            status: false,
            message: err.message
        };
    }
};




export { getUser, registerUser, optinAsset };
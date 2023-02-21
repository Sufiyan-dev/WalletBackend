import { transferERC20, checkBalanceOfUser } from "../services/transaction.service.js"


const tokenTransfer = async (req,res) => {
    const user = req.params.username
    const { contractAddress, amount, to} = req.body
    transferERC20(user, contractAddress, amount, to)
}

const balanceCheck = async (req,res) => {
    const address = req.params.address
    const contractAddress = req.body.contractAddress
    checkBalanceOfUser(address,contractAddress)
}

export { tokenTransfer, balanceCheck }
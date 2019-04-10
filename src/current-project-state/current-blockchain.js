const ETHEREUM_CONSTANTS = require('../utilities/constants/blockchains-constants')
    .ETHEREUM_CONSTANTS
const BITCOIN_CONSTANTS = require('../utilities/constants/blockchains-constants')
    .BITCOIN_CONSTANTS

const eth = require('../download/blockchain/ethereum')

const CURRENT_BLOCKCHAINS = Object.freeze({
    ethereum: {
        folder_name: ETHEREUM_CONSTANTS.folderName(),
        type_name: ETHEREUM_CONSTANTS.argumentsName(),
        first_date: ETHEREUM_CONSTANTS.firstBlockDate(),
        last_block_id: eth.lastBlockId,
        get_block_time: eth.getBlockTime,
        get_transactions: eth.getTransactions
    },
    bitcoin: {
        folder_name: BITCOIN_CONSTANTS.folderName(),
        type_name: BITCOIN_CONSTANTS.argumentsName(),
        first_date: BITCOIN_CONSTANTS.firstBlockDate(),
        last_block_id: '',
        get_block_time: '',
        get_transactions: ''
    }
})

module.exports = {
    CURRENT_BLOCKCHAINS
}

const Web3 = require('web3')
const _ = require('lodash')

const RunSettings = require('./../../utilities/settings/run-settings')

const { timestampToDate } = require('./../../utilities/date-utils')

var web3 = undefined

async function lastBlockId() {
    initWeb3()

    const syncResult = await web3.eth.isSyncing()
    if (syncResult) {
        return syncResult.currentBlock
    } else {
        const lastBlockNumber = await web3.eth.getBlockNumber()
        return lastBlockNumber
    }
}

async function getBlockTime(blockId) {
    initWeb3()

    const block = await web3.eth.getBlock(blockId)
    return timestampToDate(block.timestamp)
}

async function getTransactions(blocksIndexes) {
    initWeb3()

    //download blocks
    function downloadBlock(index) {
        return web3.eth
            .getBlock(index, true)
            .then(block => {
                return block
            })
            .catch(err => {
                return downloadBlock(index)
            })
    }
    const blocksPromises = blocksIndexes.map(x => {
        return downloadBlock(x)
    })

    //get blocks from Promises
    const blocks = _.compact(await Promise.all(blocksPromises))

    //get transactions from blocks
    const onlyTransactions = blocks.map(b => ({
        transactions: b.transactions
            .map(t => transformTransaction(t, web3.utils.fromWei))
            .filter(t => t.amount > 0 && t.source !== null && t.target !== null)
    }))

    const transactions = _.flatten(
        onlyTransactions
            .filter(block => block.transactions.length > 0)
            .map(block => block.transactions)
    ).map(t => JSON.stringify(t))

    return transactions
}

function transformTransaction(transaction, convertWei) {
    return {
        source: transaction.from,
        target: transaction.to,
        amount: parseFloat(convertWei(transaction.value))
    }
}

function initWeb3() {
    if (web3 == undefined) {
        web3 = new Web3(
            Web3.givenProvider ||
                `https://mainnet.infura.io/${RunSettings.getAPI()}:8546`
        )
    }
}

module.exports = {
    lastBlockId,
    getBlockTime,
    getTransactions
}

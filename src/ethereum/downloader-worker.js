const createEth = require('./eth')
const _ = require('lodash')
const {
    setTransactionStream,
    dumpTransactions
} = require('./../utilities/files')
const logger = require('./../utilities/log')

var eth

function askTask(data) {
    process.send({
        pid: process.pid,
        command: 'new task',
        data: data
    })
}

function convertTransaction(t) {
    return JSON.stringify(t)
}

process.on('message', function(message) {
    switch (message.command) {
        case 'config':
            eth = createEth(message.api)
            setTransactionStream(message.filename, () => {
                askTask(undefined)
            })
            break
        case 'task':
            eth.queryBlocks(message.task).then(block_array => {
                dumpTransactions(
                    _.flatten(
                        block_array
                            .filter(block => block.transactions.length > 0)
                            .map(block => block.transactions)
                    ).map(t => convertTransaction(t)),
                    askTask(message.task)
                )
            })
            break
        case 'end':
            process.disconnect()
            break
        default:
            logger.error(
                '[child ' +
                    process.pid +
                    '] received wrong command + ' +
                    message.command
            )
    }
})

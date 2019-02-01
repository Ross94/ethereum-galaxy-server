const createEth = require('./eth')
const _ = require('lodash')

const logger = require('./../utilities/log')
const {
    setTransactionStream,
    dumpTransactions
} = require('./../utilities/files')

var eth
var running = true

process.on('SIGINT', () => {
    running = false
})

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
            if (running) {
                eth.queryBlocks(message.task).then(block_array => {
                    dumpTransactions(
                        _.flatten(
                            block_array
                                .filter(block => block.transactions.length > 0)
                                .map(block => block.transactions)
                        ).map(t => convertTransaction(t)),
                        () => askTask(message.task)
                    )
                })
            } else {
                process.send({
                    pid: process.pid,
                    command: 'stopped'
                })
                process.disconnect()
                process.exit(0)
            }
            break
        case 'end':
            process.disconnect()
            process.exit(0)
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

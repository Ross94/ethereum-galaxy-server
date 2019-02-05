const createEth = require('./eth')
const _ = require('lodash')

const DownloadWorkerShutdown = require('./../shutdown/download-worker-shutdown')
const logger = require('./../utilities/log')
const GlobalProcessCommand = require('./../utilities/process')
    .GlobalProcessCommand
const DownloadProcessCommand = require('./../utilities/process')
    .DownloadProcessCommand
const {
    setTransactionStream,
    dumpTransactions
} = require('./../utilities/files')
const { sendMessage } = require('./../utilities/process')

var eth

function convertTransaction(t) {
    return JSON.stringify(t)
}

process.on('message', function(message) {
    switch (message.command) {
        case DownloadProcessCommand.configCommand():
            DownloadWorkerShutdown.setShutdownBehaviour()
            eth = createEth(message.data.api)
            setTransactionStream(message.data.filename, () => {
                sendMessage(DownloadProcessCommand.newTaskCommand())
            })
            break
        case DownloadProcessCommand.newTaskCommand():
            if (DownloadWorkerShutdown.isRunning()) {
                eth.queryBlocks(message.data.task).then(block_array => {
                    dumpTransactions(
                        _.flatten(
                            block_array
                                .filter(block => block.transactions.length > 0)
                                .map(block => block.transactions)
                        ).map(t => convertTransaction(t)),
                        () =>
                            sendMessage(
                                DownloadProcessCommand.newTaskCommand(),
                                message.data.task
                            )
                    )
                })
            } else {
                sendMessage(GlobalProcessCommand.stoppedCommand())
                DownloadWorkerShutdown.terminate()
            }
            break
        case GlobalProcessCommand.endCommand():
            DownloadWorkerShutdown.terminate()
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

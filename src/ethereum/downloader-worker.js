const createEth = require('./eth')
const _ = require('lodash')

const DownloadWorkerShutdown = require('./../shutdown/download-worker-shutdown')

const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const DOWNLOAD_PROCESS_COMMAND = require('./../utilities/process')
    .DOWNLOAD_PROCESS_COMMAND

const logger = require('./../utilities/log')

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
        case DOWNLOAD_PROCESS_COMMAND.configCommand():
            DownloadWorkerShutdown.setShutdownBehaviour()
            eth = createEth(message.data.api)
            setTransactionStream(message.data.filename, () => {
                sendMessage(DOWNLOAD_PROCESS_COMMAND.newTaskCommand(), {
                    config: true
                })
            })
            break
        case DOWNLOAD_PROCESS_COMMAND.newTaskCommand():
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
                                DOWNLOAD_PROCESS_COMMAND.newTaskCommand(),
                                { config: false }
                            )
                    )
                })
            } else {
                sendMessage(GLOBAL_PROCESS_COMMAND.stoppedCommand())
                DownloadWorkerShutdown.terminate()
            }
            break
        case GLOBAL_PROCESS_COMMAND.endCommand():
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

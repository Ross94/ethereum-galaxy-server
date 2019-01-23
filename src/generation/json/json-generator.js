const constraints = require('./../../utilities/constraints')
const logger = require('./../../utilities/log')

const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    nodesJsonName,
    transactionsJsonName
} = require('./../../utilities/config')

process.on('message', function(message) {
    switch (message.command) {
        case 'start':
            logger.setPath(message.loggerPath)
            constraints.setSaveFolder(message.saveFolder)
            constraints.setFolderName(message.folderName)
            constraints.setRange(message.range)
            constraints.setProcessNum(message.processNum)
            constraints.setMemory(message.memory)

            if (message.oldDownload) {
                split()
            } else {
                aggregate()
            }
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

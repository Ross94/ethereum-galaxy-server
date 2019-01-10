const constraints = require('./constraints')
const logger = require('./log')
const { aggregate } = require('./aggregator')

process.on('message', function(message) {
    switch (message.command) {
        case 'start':
            logger.setPath(message.loggerPath)
            constraints.setSaveFolder(message.saveFolder)
            constraints.setFolderName(message.folderName)
            constraints.setRange(message.range)
            constraints.setProcessNum(message.processNum)
            constraints.setMemory(message.memory)
            aggregate()
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

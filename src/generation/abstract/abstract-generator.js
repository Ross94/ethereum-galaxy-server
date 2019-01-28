const constraints = require('../../utilities/constraints')
const logger = require('../../utilities/log')

split = function() {
    throw 'error, override this function in another module'
}

aggregate = function() {
    throw 'error, override this function in another module'
}

function startProcess() {
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
                    module.exports.split()
                } else {
                    module.exports.aggregate()
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
}

module.exports = {
    split,
    aggregate,
    startProcess
}

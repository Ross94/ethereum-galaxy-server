const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const RunSettings = require('../../utilities/settings/run-settings')
const SpecSettings = require('../../utilities/settings/spec-settings')
const logger = require('../../utilities/log')

split = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'split')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'aggregate')
}

function startProcess() {
    process.on('message', function(message) {
        switch (message.command) {
            case 'start':
                logger.setPath(message.loggerPath)
                RunSettings.setSaveFolderPath(message.saveFolder)
                RunSettings.setFolderName(message.folderName)
                RunSettings.setRange(message.range)
                SpecSettings.setProcessMemory(message.memory)

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

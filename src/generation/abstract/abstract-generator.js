const GenerationShutdown = require('../../shutdown/generation-shutdown')
const GlobalProcessCommand = require('./../../utilities/process')
    .GlobalProcessCommand
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GenerationProcessPhases = require('./../../shutdown/phases')
    .GenerationProcessPhases
const RunSettings = require('../../utilities/settings/run-settings')
const SpecSettings = require('../../utilities/settings/spec-settings')
const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const logger = require('../../utilities/log')

split = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'split')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'aggregate')
}

function startProcess(formatName) {
    FormatSettings.setFormat(formatName)

    process.on('message', function(message) {
        switch (message.command) {
            case GlobalProcessCommand.startCommand():
                //global settings
                GenerationShutdown.setShutdownBehaviour()

                logger.setPath(message.data.loggerPath)
                RunSettings.setSaveFolderPath(message.data.saveFolder)
                RunSettings.setFolderName(message.data.folderName)
                RunSettings.setRange(message.data.range)
                SpecSettings.setProcessMemory(message.data.memory)

                if (message.data.resumeData === undefined) {
                    if (message.data.oldDownload) {
                        module.exports.split()
                    } else {
                        module.exports.aggregate()
                    }
                } else {
                    //resume case
                    RecoverySettings.setCurrentReadPhase(
                        message.data.resumeData.phase
                    )
                    RecoverySettings.setLastLine(
                        message.data.resumeData.last_line
                    )
                    RecoverySettings.setCurrentFilepath(
                        message.data.resumeData.file_path
                    )

                    switch (message.data.resumeData.phase) {
                        case GenerationProcessPhases.SplitPhase():
                            module.exports.split()
                            break
                        case GenerationProcessPhases.NodesPhase():
                        case GenerationProcessPhases.TransactionsPhase():
                            module.exports.aggregate()
                            break
                        case GenerationProcessPhases.ComposePhase():
                            console.log(
                                'TO-DO compose phase resume in abstract generator'
                            )
                            break
                    }
                }

                break
            case GlobalProcessCommand.endCommand():
                GenerationShutdown.terminate()
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

const fs = require('fs')

const FormatSettings = require('./../../utilities/settings/format-settings')
const GlobalProcessCommand = require('./../../utilities/process')
    .GlobalProcessCommand
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GenerationProcessPhases = require('./../../shutdown/phases')
    .GenerationProcessPhases
const writer = require('./../writer')
const reader = require('./../reader')
const logger = require('./../../utilities/log')
const GenerationShutdown = require('../../shutdown/generation-shutdown')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const { checkResourceExists } = require('./../../utilities/utils')
const { sendMessage } = require('./../../utilities/process')

const TYPE = Object.freeze({
    node: 'node',
    transaction: 'transaction'
})

path = {
    graphPath: ERRORS_MESSAGES.fieldError(
        'abstract-splitter',
        'path.graphPath'
    ),
    nodePath: ERRORS_MESSAGES.fieldError('abstract-splitter', 'path.nodePath'),
    transactionPath: ERRORS_MESSAGES.fieldError(
        'abstract-splitter',
        'path.transactionPath'
    )
}

parser = function(line) {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'parser')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'aggregate')
}

function split() {
    logger.log('Start ' + FormatSettings.getFormat() + ' splitting')
    GenerationShutdown.changePhase(GenerationProcessPhases.SplitPhase())

    const graphPath = module.exports.path.graphPath
    const nodePath = module.exports.path.nodePath
    const transactionPath = module.exports.path.transactionPath

    var nodeWriter
    var transactionWriter
    var lastLine = 0

    var writeTerminated = 0
    var callTerminate = false

    if (checkResourceExists(graphPath)) {
        writer(nodePath, nodeW => {
            nodeWriter = nodeW
            writer(transactionPath, transactionW => {
                transactionWriter = transactionW

                const lineReader = reader(
                    graphPath,
                    GenerationProcessPhases.SplitPhase(),
                    line => {
                        return line
                    },
                    (lines, options) => {
                        lines.some(line => {
                            if (GenerationShutdown.isRunning()) {
                                lastLine++
                                addToFile(line)
                            } else {
                                callTerminate = true
                                return true
                            }
                        })
                        if (options.endFile && !callTerminate) {
                            module.exports.aggregate()
                        } else {
                            lineReader.nextLines()
                        }
                    }
                )
                lineReader.nextLines()
            })
        })
    }

    function addToFile(line) {
        const elem = module.exports.parser(line)
        switch (elem.type) {
            case TYPE.node:
                writeElem(nodeWriter, elem.data)
                break
            case TYPE.transaction:
                writeElem(transactionWriter, elem.data)
                break
            default:
                /*
                needed for line not to write (*Verticles, {nodes: [], ...),
                whitout this, writeTerminated !== lastLine and never shutdown
                */
                writeTerminated++
        }
    }

    function writeElem(writer, data) {
        writer.write(data, () => {
            writeTerminated++
            if (writeTerminated === lastLine) {
                terminate()
            }
        })
    }

    function terminate() {
        if (callTerminate) {
            sendMessage(GlobalProcessCommand.stoppedCommand(), {
                format: {
                    format_name: FormatSettings.getFormat(),
                    phase: GenerationShutdown.getCurrentPhase(),
                    last_line: lastLine + RecoverySettings.getLastLine(),
                    file_path: graphPath
                }
            })
            GenerationShutdown.terminate()
        }
    }
}

module.exports = {
    path,
    parser,
    aggregate,
    TYPE,
    split
}

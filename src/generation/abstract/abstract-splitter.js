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
                        lines.forEach(line => {
                            console.log(line)
                            if (GenerationShutdown.isRunning()) {
                                lastLine++
                                addToFile(line)
                            } else {
                                sendMessage(
                                    GlobalProcessCommand.stoppedCommand(),
                                    {
                                        format: {
                                            format_name: FormatSettings.getFormat(),
                                            phase: GenerationShutdown.getCurrentPhase(),
                                            last_line: lastLine,
                                            file_path: graphPath
                                        }
                                    }
                                )
                                GenerationShutdown.terminate()
                            }
                        })
                        if (options.endFile) {
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
                nodeWriter.write(elem.data)
                break
            case TYPE.transaction:
                transactionWriter.write(elem.data)
                break
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

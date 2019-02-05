const fs = require('fs')

const FormatSettings = require('./../../utilities/settings/format-settings')
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')
const { checkResourceExists } = require('./../../utilities/utils')

path = {
    graphPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.graphPath'
    ),
    tempPath: ERRORS_MESSAGES.fieldError('abstract-composer', 'path.tempPath'),
    nodesPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.nodesPath'
    ),
    transactionsPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.transactionsPath'
    )
}

nodesPhaseStart = function() {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseStart')
}

nodesPhaseLine = function(lines, hasLast) {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseLine')
}

nodesPhaseEnd = function() {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseEnd')
}

transactionsPhaseStart = function() {
    throw ERRORS_MESSAGES.functionError(
        'abstract-composer',
        'transactionsPhaseStart'
    )
}

transactionsPhaseLine = function(lines, hasLast) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-composer',
        'transactionsPhaseLine'
    )
}

transactionsPhaseEnd = function() {
    ERRORS.functionError('abstract-composer', 'transactionsPhaseEnd')
}

function compose() {
    const graphPath = module.exports.path.graphPath
    const tempPath = module.exports.path.tempPath
    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    var lineReader
    var tempWriter

    if (checkResourceExists(tempPath)) {
        fs.unlinkSync(tempPath)
    }
    writer(tempPath, writer => {
        tempWriter = writer
        nodePhase()
    })

    function nodePhase() {
        lineReader = reader(
            nodesPath,
            line => {
                return line
            },
            (lines, options) => {
                const writableLines = module.exports.nodesPhaseLine(
                    lines,
                    options.endFile
                )
                tempWriter.writeArray(writableLines, () => {
                    if (options.endFile) {
                        tempWriter.write(module.exports.nodesPhaseEnd())

                        logger.log(
                            'End compact ' + module.exports.format + ' nodes'
                        )
                        transactionPhase()
                    } else {
                        lineReader.nextLines()
                    }
                })
            }
        )

        logger.log('Start compact ' + FormatSettings.getFormat() + ' nodes')
        tempWriter.write(module.exports.nodesPhaseStart())
        lineReader.nextLines()
    }

    function transactionPhase() {
        lineReader = reader(
            transactionsPath,
            line => {
                return line
            },
            (lines, options) => {
                const writableLines = module.exports.transactionsPhaseLine(
                    lines,
                    options.endFile
                )
                tempWriter.writeArray(writableLines, () => {
                    if (options.endFile) {
                        tempWriter.write(module.exports.transactionsPhaseEnd())

                        logger.log(
                            'End compact ' +
                                FormatSettings.getFormat() +
                                ' transactions'
                        )
                        if (checkResourceExists(graphPath)) {
                            fs.unlinkSync(graphPath)
                        }
                        fs.renameSync(tempPath, graphPath)
                        //communicate to master end generation
                        process.send({
                            pid: process.pid,
                            command: 'end'
                        })
                    } else {
                        lineReader.nextLines()
                    }
                })
            }
        )

        logger.log(
            'Start compact ' + FormatSettings.getFormat() + ' transactions'
        )
        tempWriter.write(module.exports.transactionsPhaseStart())
        lineReader.nextLines()
    }
}

module.exports = {
    path,
    nodesPhaseStart,
    nodesPhaseLine,
    nodesPhaseEnd,
    transactionsPhaseStart,
    transactionsPhaseLine,
    transactionsPhaseEnd,
    compose
}

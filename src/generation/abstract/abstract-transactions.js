const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GenerationProcessPhases = require('./../../shutdown/phases')
    .GenerationProcessPhases
const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')
const GenerationShutdown = require('./../../shutdown/generation-shutdown')

path = {
    nodesPath: ERRORS_MESSAGES.fieldError(
        'abstract-transactions',
        'path.nodesPath'
    ),
    transactionsPath: ERRORS_MESSAGES.fieldError(
        'abstract-transactions',
        'path.transactionsPath'
    )
}

nodeFileParser = function(line) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'nodeFileParser'
    )
}

tempFileParser = function(line) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'tempFileParser'
    )
}

transactionConverter = function(transaction, nodes) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'transactionConverter'
    )
}

function transactionsAggregation(filePath, cb) {
    GenerationShutdown.changePhase(GenerationProcessPhases.TransactionsPhase())

    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    const tempReader = tempInitializer()

    var transactions = []
    var transactionsEnded = false
    var nodesReader
    var transactionsWriter

    var lastLine =
        filePath === RecoverySettings.getCurrentFilepath() &&
        GenerationProcessPhases.TransactionsPhase() ===
            RecoverySettings.getCurrentReadPhase()
            ? RecoverySettings.getLastLine()
            : 0
    var saveLine = 0

    writer(transactionsPath, writer => {
        transactionsWriter = writer
        logger.log(
            'Start ' +
                FormatSettings.getFormat() +
                ' transactions copy from ' +
                filePath
        )
        tempReader.nextLines()
    })

    function tempInitializer() {
        return reader(
            filePath,
            GenerationProcessPhases.TransactionsPhase(),
            module.exports.tempFileParser,
            (lines, options) => {
                transactions = _.flatten(lines)
                lastLine += lines.length
                if (options.endFile) {
                    transactionsEnded = true
                }
                nodesReader = nodesInitializer()
                nodesReader.nextLines()
            }
        )
    }

    function nodesInitializer() {
        return reader(
            nodesPath,
            GenerationProcessPhases.TransactionsPhase(),
            module.exports.nodeFileParser,
            (lines, options) => {
                const nodes = new RBTree((a, b) => {
                    return a.key.localeCompare(b.key)
                })

                lines.forEach(elem => nodes.insert(elem))

                transactions = transactions.map(transaction => {
                    if (GenerationShutdown.isRunning()) {
                        return module.exports.transactionConverter(
                            transaction,
                            nodes
                        )
                    } else {
                        GenerationShutdown.saveState(saveLine, filePath)
                        GenerationShutdown.terminate()
                    }
                })

                if (options.endFile) {
                    transactionsWriter.writeArray(
                        transactions.map(line => line + '\n'),
                        () => {
                            saveLine = lastLine
                            if (transactionsEnded) {
                                logger.log(
                                    'Termanited ' +
                                        FormatSettings.getFormat() +
                                        ' transactions copy from ' +
                                        filePath
                                )
                                cb()
                            } else {
                                if (GenerationShutdown.isRunning()) {
                                    tempReader.nextLines()
                                } else {
                                    GenerationShutdown.saveState(
                                        saveLine,
                                        filePath
                                    )
                                    GenerationShutdown.terminate()
                                }
                            }
                        }
                    )
                } else {
                    nodesReader.nextLines()
                }
                //convert transaction from json to pajek
                /*transactions = module.exports.transactionConverter(
                    lines,
                    transactions
                )
                if (options.endFile) {
                    transactionsWriter.writeArray(
                        transactions.map(line => line + '\n'),
                        () => {
                            saveLine = lastLine
                            if (transactionsEnded) {
                                logger.log(
                                    'Termanited ' +
                                        FormatSettings.getFormat() +
                                        ' transactions copy from ' +
                                        filePath
                                )
                                cb()
                            } else {
                                if(GenerationShutdown.isRunning()) {
                                    tempReader.nextLines()
                                } else {
                                    GenerationShutdown.saveState(saveLine, filePath)
                                    GenerationShutdown.terminate()
                                }
                            }
                        }
                    )
                } else {
                    nodesReader.nextLines()
                }*/
            }
        )
    }
}

module.exports = {
    path,
    nodeFileParser,
    tempFileParser,
    transactionConverter,
    transactionsAggregation
}

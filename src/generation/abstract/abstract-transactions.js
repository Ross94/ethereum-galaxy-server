const _ = require('lodash')

const FormatSettings = require('./../../utilities/settings/format-settings')
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')

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

transactionConverter = function(lines, transactions) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'transactionConverter'
    )
}

function transactionsAggregation(filePath, cb) {
    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    const tempReader = tempInitializer()

    var transactions = []
    var lastLine = false
    var nodesReader
    var transactionsWriter
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
            module.exports.tempFileParser,
            (lines, options) => {
                transactions = _.flatten(lines)
                if (options.endFile) {
                    lastLine = true
                }
                nodesReader = nodesInitializer()
                nodesReader.nextLines()
            }
        )
    }

    function nodesInitializer() {
        return reader(
            nodesPath,
            module.exports.nodeFileParser,
            (lines, options) => {
                //convert transaction from json to pajek
                transactions = module.exports.transactionConverter(
                    lines,
                    transactions
                )
                if (options.endFile) {
                    transactionsWriter.writeArray(
                        transactions.map(line => line + '\n'),
                        () => {
                            if (lastLine) {
                                logger.log(
                                    'Termanited ' +
                                        FormatSettings.getFormat() +
                                        ' transactions copy from ' +
                                        filePath
                                )
                                cb()
                            } else {
                                tempReader.nextLines()
                            }
                        }
                    )
                } else {
                    nodesReader.nextLines()
                }
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

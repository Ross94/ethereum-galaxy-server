const _ = require('lodash')

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

format = 'override this field in another module'

path = {
    nodesPath: 'override this field in another module',
    transactionsPath: 'override this field in another module'
}

nodeFileParser = function(line) {
    throw 'error, override this function in another module'
}

tempFileParser = function(line) {
    throw 'error, override this function in another module'
}

transactionConverter = function(lines, transactions) {
    throw 'error, override this function in another module'
}

//chiamata 2 volte
function transactionsAggregation(filePath, cb) {
    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    const tempReader = tempInitializer()

    var transactions = []
    var lastLine = false
    var nodesReader
    var transactionsWriter
    writer(transactionsPath, w => {
        transactionsWriter = w
        logger.log(
            'Start ' +
                module.exports.format +
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
                                        module.exports.format +
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
    format,
    path,
    nodeFileParser,
    tempFileParser,
    transactionConverter,
    transactionsAggregation
}

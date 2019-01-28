const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const writer = require('./../writer')
const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')

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

format = ERRORS_MESSAGES.fieldError('abstract-splitter', 'format')

parser = function(line) {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'parser')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'aggregate')
}

function split() {
    const graphPath = module.exports.path.graphPath
    const nodePath = module.exports.path.nodePath
    const transactionPath = module.exports.path.transactionPath

    var nodeWriter
    var transactionWriter

    logger.log('Start ' + module.exports.format + ' splitting')
    if (checkResourceExists(graphPath)) {
        writer(nodePath, nodeW => {
            nodeWriter = nodeW
            writer(transactionPath, transactionW => {
                transactionWriter = transactionW
                const lineReader = require('readline').createInterface({
                    input: require('fs').createReadStream(graphPath)
                })

                lineReader
                    .on('line', function(line) {
                        addToFile(line)
                    })
                    .on('close', function() {
                        logger.log(
                            module.exports.format + ' splitting terminated'
                        )
                        module.exports.aggregate()
                    })
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
    format,
    parser,
    aggregate,
    TYPE,
    split
}

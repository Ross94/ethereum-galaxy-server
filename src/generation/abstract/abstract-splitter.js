const writer = require('./../temp-writer')
const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')

path = {
    graphPath: 'override this field in another module',
    nodePath: 'override this field in another module',
    transactionPath: 'override this field in another module'
}

format = 'override this field in another module'

parser = function(line) {
    throw 'error, override this function in another module'
}

aggregate = function() {
    throw 'error, override this function in another module'
}

const TYPE = Object.freeze({
    node: 'node',
    transaction: 'transaction'
})

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

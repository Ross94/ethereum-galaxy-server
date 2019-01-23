const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

const {
    graphNoLayoutTemporary,
    nodesPajekName,
    transactionsPajekName
} = require('./../../utilities/config')

function pajekTransactionsAggregation(filePath, cb) {
    const nodesPath = graphNoLayoutTemporary() + nodesPajekName()
    const transactionsPath = graphNoLayoutTemporary() + transactionsPajekName()

    const transactionsWriter = writer(transactionsPath)
    const transactionsReader = transactionsInitializer()

    var transactions = []
    var nodes = new RBTree((a, b) => {
        return a.key.localeCompare(b.key)
    })
    var lastLine = false
    var nodesReader = nodesInitializer()

    logger.log('Start Pajek transactions copy from ' + filePath)
    transactionsReader.nextLines()

    function transactionsInitializer() {
        return reader(
            filePath,
            line => {
                return JSON.parse(line)
            },
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
            line => {
                const parts = line.split(' ')
                return {
                    key: parts[1].replace(/"/g, ''),
                    val: parseInt(parts[0])
                }
            },
            (lines, options) => {
                function getIndex(hashCode) {
                    if (typeof hashCode == 'string') {
                        const elem = nodes.find({ key: hashCode })
                        return elem != null ? elem.val : hashCode
                    }
                    return hashCode
                }

                nodes = new RBTree((a, b) => {
                    return a.key.localeCompare(b.key)
                })
                //convert transaction from json to pajek
                lines.forEach(elem => nodes.insert(elem))
                transactions = transactions.map(trans => {
                    trans.source = getIndex(trans.source)
                    trans.target = getIndex(trans.target)
                    if (
                        typeof trans.source == 'number' &&
                        typeof trans.target == 'number'
                    ) {
                        return (
                            trans.source +
                            ' ' +
                            trans.target +
                            ' "' +
                            trans.amount +
                            '"'
                        )
                    } else {
                        return trans
                    }
                })

                if (options.endFile) {
                    transactionsWriter.writeArray(
                        transactions.map(line => line + '\n'),
                        () => {
                            if (lastLine) {
                                logger.log(
                                    'Termanited Pajek transactions copy from ' +
                                        filePath
                                )
                                cb()
                            } else {
                                transactionsReader.nextLines()
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
    pajekTransactionsAggregation
}

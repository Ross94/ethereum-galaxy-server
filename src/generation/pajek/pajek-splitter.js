const fs = require('fs')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')
const { aggregate } = require('./pajek-aggregator')
const {
    graphNoLayoutTemporary,
    pajekGraphName,
    nodesPajekName,
    transactionsPajekName
} = require('./../../utilities/config')

function split() {
    const graphPath = graphNoLayoutTemporary() + pajekGraphName()
    const nodePath = graphNoLayoutTemporary() + nodesPajekName()
    const transactionPath = graphNoLayoutTemporary() + transactionsPajekName()

    const TYPE = Object.freeze({
        node: 'node',
        transaction: 'transaction'
    })

    var nodeWriter
    var transactionWriter

    logger.log('Start Pajek splitting')
    if (checkResourceExists(graphPath)) {
        nodeWriter = writer(nodePath)
        transactionWriter = writer(transactionPath)

        const lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(graphPath)
        })

        lineReader
            .on('line', function(line) {
                addToFile(line)
            })
            .on('close', function() {
                logger.log('Pajek splitting terminated')
                aggregate()
            })
    }

    function addToFile(line) {
        const elem = parserLine(line)
        switch (elem.type) {
            case TYPE.node:
                nodeWriter.write(elem.data)
                break
            case TYPE.transaction:
                transactionWriter.write(elem.data)
                break
        }
    }

    function parserLine(line) {
        var type = 'error'
        var data = undefined
        if (!line.includes('*')) {
            if (line.split(' ').length == 2) {
                type = TYPE.node
            } else if (line.split(' ').length == 3) {
                type = TYPE.transaction
            }
            data = line + '\n'
        }
        return {
            type: type,
            data: data
        }
    }
}

module.exports = {
    split
}

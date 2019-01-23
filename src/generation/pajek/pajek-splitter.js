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
    const resPath = graphNoLayoutTemporary() + pajekGraphName()
    const nodePath = graphNoLayoutTemporary() + nodesPajekName()
    const transactionPath = graphNoLayoutTemporary() + transactionsPajekName()

    var nodeWriter
    var transactionWriter

    var lineReader

    logger.log('Start Pajek splitting')
    if (checkResourceExists(resPath)) {
        nodeWriter = writer(nodePath)
        transactionWriter = writer(transactionPath)

        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(resPath)
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
        const elem = parser(line)
        switch (elem.type) {
            case 'node':
                nodeWriter.write(elem.data)
                break
            case 'transaction':
                transactionWriter.write(elem.data)
                break
        }
    }

    function parser(line) {
        var type = 'error'
        var data = undefined
        if (!line.includes('*')) {
            if (line.split(' ').length == 2) {
                type = 'node'
            } else if (line.split(' ').length == 3) {
                type = 'transaction'
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

const fs = require('fs')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')
const { aggregate } = require('./json-aggregator')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    nodesJsonName,
    transactionsJsonName
} = require('./../../utilities/config')

function split() {
    const graphPath = graphNoLayoutTemporary() + jsonGraphName()
    const nodePath = graphNoLayoutTemporary() + nodesJsonName()
    const transactionPath = graphNoLayoutTemporary() + transactionsJsonName()

    var nodeWriter
    var transactionWriter

    logger.log('Start Json splitting')
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
                logger.log('Json splitting terminated')
                aggregate()
            })
    }

    function addToFile(line) {
        const elem = parseLine(line)
        switch (elem.type) {
            case 'node':
                nodeWriter.write(elem.data)
                break
            case 'transaction':
                transactionWriter.write(elem.data)
                break
        }
    }

    function parseLine(line) {
        try {
            var type = 'error'

            const parsableElem =
                line[line.length - 1] === ',' ? line.slice(0, -1) : line
            const data = JSON.parse(parsableElem)
            if (data.id != undefined) {
                type = 'node'
            } else if (data.source != undefined) {
                type = 'transaction'
            }
            return {
                type: type,
                data: JSON.stringify(data) + '\n'
            }
        } catch (err) {
            //here will be some lines of json utilities (ex. {"nodes":[)
            return {
                type: 'error',
                data: undefined
            }
        }
    }
}

module.exports = {
    split
}

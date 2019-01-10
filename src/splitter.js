const fs = require('fs')
const reader = require('./temp-reader')
const writer = require('./temp-writer')
const logger = require('./log')
const { checkResourceExists } = require('./utils')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    nodesName,
    transactionsName
} = require('./config')

const resPath = graphNoLayoutTemporary() + jsonGraphName()
const nodePath = graphNoLayoutTemporary() + nodesName()
const transactionPath = graphNoLayoutTemporary() + transactionsName()

var nodeWriter
var transactionWriter

var lineReader

function convertToRow(elem) {
    return JSON.stringify(elem) + '\n'
}

function addToFile(elem) {
    if (elem.id != undefined) {
        nodeWriter.write(convertToRow(elem))
    } else {
        transactionWriter.write(convertToRow(elem))
    }
}

function split(cb) {
    logger.log('Start splitting')
    if (checkResourceExists(resPath)) {
        nodeWriter = writer(nodePath)
        transactionWriter = writer(transactionPath)

        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(resPath)
        })

        lineReader
            .on('line', function(line) {
                try {
                    var elem = JSON.parse(line.slice(0, -1))
                    addToFile(elem)
                } catch (err) {
                    try {
                        elem = JSON.parse(line)
                        addToFile(elem)
                    } catch (err) {}
                }
            })
            .on('close', function() {
                logger.log('Splitting terminated')
                cb()
            })
    }
}

module.exports = {
    split
}

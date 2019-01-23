const fs = require('fs')

const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')
const {
    nodesJsonName,
    transactionsJsonName,
    graphNoLayoutTemporary,
    jsonGraphName
} = require('./../../utilities/config')

const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

const resPath = graphNoLayoutTemporary() + jsonGraphName()
const tempPath = graphNoLayoutTemporary() + 'temp.json'
const nodePath = graphNoLayoutTemporary() + nodesJsonName()
const transactionPath = graphNoLayoutTemporary() + transactionsJsonName()

const jsonLines = {
    open: '{"nodes":[',
    mid: '],"links":[',
    close: ']}'
}

function compose() {
    var tempWriter
    var lineReader
    var l = undefined

    if (checkResourceExists(tempPath)) {
        fs.unlinkSync(tempPath)
    }

    tempWriter = writer(tempPath)
    lineReader = createReader(nodePath)

    tempWriter.write(jsonLines.open + '\n')
    nodePhase()

    function createReader(filepath) {
        return require('readline').createInterface({
            input: require('fs').createReadStream(filepath)
        })
    }

    function commonLine(line) {
        tempWriter.write('\t\t' + line + ',\n')
    }

    function lastLine(line) {
        tempWriter.write('\t\t' + line + '\n')
    }

    function nodePhase() {
        logger.log('Start compact Json nodes')
        lineReader
            .on('line', function(line) {
                if (l != undefined) commonLine(l)
                l = line
            })
            .on('close', function() {
                if (l != undefined) lastLine(l)
                tempWriter.write('\t' + jsonLines.mid + '\n')
                logger.log('End compact Json nodes')
                transactionPhase()
            })
    }

    function transactionPhase() {
        logger.log('Start compact Json transactions')
        lineReader = createReader(transactionPath)
        l = undefined
        lineReader
            .on('line', function(line) {
                if (l != undefined) commonLine(l)
                l = line
            })
            .on('close', function() {
                if (l != undefined) lastLine(l)
                tempWriter.write(jsonLines.close + '\n')
                logger.log('End compact Json transactions')
                if (checkResourceExists(resPath)) {
                    fs.unlinkSync(resPath)
                }
                fs.renameSync(tempPath, resPath)
                //communicate to master end generation
                process.send({
                    pid: process.pid,
                    command: 'end'
                })
            })
    }
}

module.exports = {
    compose
}

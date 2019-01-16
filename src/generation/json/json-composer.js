const fs = require('fs')

const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')
const {
    nodesName,
    transactionsName,
    graphNoLayoutTemporary,
    jsonGraphName
} = require('./../../utilities/config')

const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

const resPath = graphNoLayoutTemporary() + jsonGraphName()
const tempPath = graphNoLayoutTemporary() + 'temp.json'
const nodePath = graphNoLayoutTemporary() + nodesName()
const transactionPath = graphNoLayoutTemporary() + transactionsName()

const jsonLines = {
    open: '{"nodes":[',
    mid: '],"links":[',
    close: ']}'
}

var tempWriter

var lineReader
var l = undefined

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
    logger.log('Start compact nodes')
    lineReader
        .on('line', function(line) {
            if (l != undefined) commonLine(l)
            l = line
        })
        .on('close', function() {
            if (l != undefined) lastLine(l)
            tempWriter.write('\t' + jsonLines.mid + '\n')
            logger.log('End compact nodes')
            transactionPhase()
        })
}

function transactionPhase() {
    logger.log('Start compact transactions')
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
            logger.log('End compact transactions')
            if (checkResourceExists(resPath)) {
                fs.unlinkSync(resPath)
            }
            fs.renameSync(tempPath, resPath)
            //dire al master che ho finito
            process.send({
                pid: process.pid,
                command: 'end'
            })
        })
}

function compose() {
    if (checkResourceExists(tempPath)) {
        fs.unlinkSync(tempPath)
    }

    tempWriter = writer(tempPath)
    lineReader = createReader(nodePath)

    tempWriter.write(jsonLines.open + '\n')
    nodePhase()
}

module.exports = {
    compose
}

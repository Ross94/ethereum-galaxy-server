const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const logger = require('./../../utilities/log')
const {
    graphNoLayoutTemporary,
    nodesName,
    transactionsName
} = require('./../../utilities/config')
const { compose } = require('./composer')

const writer = require('./../temp-writer')
const reader = require('./../temp-reader')

const path = graphNoLayoutTemporary()
const nodesPath = graphNoLayoutTemporary() + nodesName()
const transactionsPath = graphNoLayoutTemporary() + transactionsName()

var nodesWriter
var transactionsWriter

var tempFiles

var nodesJson = undefined
var tempJson = undefined

var nextFile = 0
var currentFile = -1
var nodesToWrite
var lastTempRead = false

function getFiles(filePath) {
    return require('fs').readdirSync(filePath)
}

function nodeParser(line) {
    const e = JSON.parse(line)
    return [e.id]
}

function nodesInitializer() {
    nodesJson = reader(nodesPath, nodeParser, (lines, options) => {
        _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

        if (options.endFile) {
            endTempBlock(() => {
                resetElemsToWrite()
                nodesInitializer()
                if (lastTempRead) {
                    logger.log(
                        'Terminated nodes extraction from ' +
                            tempFiles[currentFile]
                    )
                    writeTransactions(() => {
                        nextTempFile()
                    })
                } else {
                    tempJson.nextLines()
                }
            })
        } else {
            nodesJson.nextLines()
        }
    })
}

function transactionParser(line) {
    const e = JSON.parse(line)
    return [e.source, e.target]
}

function tempInitializer(filepath) {
    tempJson = reader(filepath, transactionParser, (lines, options) => {
        _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
        if (options.endFile) {
            lastTempRead = true
        }
        nodesJson.nextLines()
    })
}

function used() {
    return ` ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) /
        100} MB`
}

function writeTransactions(cb) {
    var lastLine = false
    const transactionReader = reader(
        tempFiles[currentFile],
        line => {
            return line
        },
        (lines, options) => {
            if (options.endFile) {
                lastLine = true
            }
            if (lines.length == 0 && lastLine) {
                logger.log(
                    'Termanited transactions copy from ' +
                        tempFiles[currentFile]
                )
                cb()
            } else {
                transactionsWriter.writeArray(
                    lines.map(line => line + '\n'),
                    () => {
                        if (lastLine) {
                            logger.log(
                                'Termanited transactions copy from ' +
                                    tempFiles[currentFile]
                            )
                            cb()
                        } else {
                            transactionReader.nextLines()
                        }
                    }
                )
            }
        }
    )
    logger.log('Start transactions copy from ' + tempFiles[currentFile])
    transactionReader.nextLines()
}

function endTempBlock(cb) {
    var writeNode = true

    function checkThreshold() {
        if (writeNode) {
            cb()
        }
    }

    function elemToJsonNode(elem) {
        const jsonData = {}
        jsonData['id'] = elem
        return JSON.stringify(jsonData)
    }

    if (nodesToWrite.size != 0) {
        writeNode = false
        const app = []
        const it = nodesToWrite.iterator()
        var item
        while ((item = it.next()) !== null) {
            app.push(item)
        }
        nodesWriter.writeArray(
            app.map(elem => elemToJsonNode(elem) + '\n'),
            () => {
                writeNode = true
                checkThreshold()
            }
        )
    }

    checkThreshold()
}

function resetElemsToWrite() {
    nodesToWrite = new RBTree((a, b) => {
        return a.localeCompare(b)
    })
}

function nextTempFile() {
    if (nextFile < tempFiles.length) {
        nodesInitializer()
        tempInitializer(tempFiles[nextFile])
        currentFile = nextFile
        nextFile++
        resetElemsToWrite()
        lastTempRead = false
        logger.log('Start node extraction of ' + tempFiles[currentFile])
        tempJson.nextLines()
    } else {
        logger.log('All temp files scanned')
        compose()
    }
}

function filterFile(file) {
    const folders = file.split('/')
    const part = folders[folders.length - 1].split('.')
    if (!isNaN(parseInt(part[0])) && part[1].localeCompare('json') == 0) {
        return true
    }
    return false
}

function aggregate() {
    logger.log('Start nodes and transactions aggregation')

    nodesWriter = writer(nodesPath)
    transactionsWriter = writer(transactionsPath)

    tempFiles = getFiles(path)
        .map(file => path + file)
        .filter(file => filterFile(file))
    nextTempFile()
}

module.exports = {
    aggregate
}

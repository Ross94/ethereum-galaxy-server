const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const logger = require('./../../utilities/log')
const {
    graphNoLayoutTemporary,
    nodesJsonName,
    transactionsJsonName
} = require('./../../utilities/config')
const { compose } = require('./json-composer')

const writer = require('./../temp-writer')
const reader = require('./../temp-reader')

const path = graphNoLayoutTemporary()
const nodesPath = graphNoLayoutTemporary() + nodesJsonName()
const transactionsPath = graphNoLayoutTemporary() + transactionsJsonName()

function aggregate() {
    var nodesWriter
    var transactionsWriter

    var tempFiles

    var nodesJson = undefined
    var tempJson = undefined

    var nextFile = 0
    var currentFile = -1
    var nodesToWrite
    var lastTempRead = false

    logger.log('Start Json nodes and transactions aggregation')

    nodesWriter = writer(nodesPath)
    transactionsWriter = writer(transactionsPath)

    tempFiles = require('fs')
        .readdirSync(path)
        .filter(file => filterFile(file))
        .map(file => path + file)

    nextTempFile()

    function filterFile(file) {
        const folders = file.split('/')
        const part = folders[folders.length - 1].split('.')
        if (!isNaN(parseInt(part[0])) && part[1].localeCompare('json') == 0) {
            return true
        }
        return false
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
                            'Terminated Json nodes extraction from ' +
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

    function writeTransactions(cb) {
        const transactionReader = reader(
            tempFiles[currentFile],
            line => {
                return line
            },
            (lines, options) => {
                transactionsWriter.writeArray(
                    lines.map(line => line + '\n'),
                    () => {
                        if (options.endFile) {
                            logger.log(
                                'Termanited Json transactions copy from ' +
                                    tempFiles[currentFile]
                            )
                            cb()
                        } else {
                            transactionReader.nextLines()
                        }
                    }
                )
            }
        )
        logger.log(
            'Start Json transactions copy from ' + tempFiles[currentFile]
        )
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
            logger.log(
                'Start Json node extraction of ' + tempFiles[currentFile]
            )
            tempJson.nextLines()
        } else {
            logger.log('All temp files scanned for Json format')
            compose()
        }
    }
}

module.exports = {
    aggregate
}

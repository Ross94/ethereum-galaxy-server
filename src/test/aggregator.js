const _ = require('lodash')

const writer = require('./writer')
const reader = require('./reader')

const tempFiles = ['22.json', '33.json']
//const tempFiles = ["0.json", "1.json"]

const nodesWriter = writer('nodes.json')
const transactionsWriter = writer('transactions.json')

var nodesJson = undefined
var tempJson = undefined

var fileIndex = 0
var nodesToWrite = []
var transactionsToWrite = []
var lastTempRead = false

function nodeParser(line) {
    const e = JSON.parse(line)
    return [e.id]
}

function nodesInitializer() {
    nodesJson = reader('nodes.json', nodeParser, (lines, options) => {
        nodesToWrite = _.difference(nodesToWrite, _.flatten(lines))
        if (options.endFile) {
            endTempBlock(() => {
                resetElemsToWrite()
                nodesInitializer()
                if (lastTempRead) {
                    nextTempFile()
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
    return {
        ids: [e.source, e.target],
        transaction: line
    }
}

function tempInitializer(filepath) {
    tempJson = reader(filepath, transactionParser, (lines, options) => {
        convertLine(lines)
        if (options.endFile) {
            lastTempRead = true
        }
        nodesJson.nextLines()
    })
}

function convertLine(lines) {
    function addNoDuplicates(array, elem) {
        if (array.indexOf(elem) == -1) array.push(elem)
    }

    lines.forEach(elem => {
        elem.ids.forEach(e => addNoDuplicates(nodesToWrite, e))
        transactionsToWrite.push(elem.transaction)
    })
}

function endTempBlock(cb) {
    function checkThreshold() {
        if (writersEnd.nodes && writersEnd.transactions) {
            cb()
        }
    }

    const writersEnd = {
        nodes: true,
        transactions: true
    }
    if (nodesToWrite.length != 0) {
        writersEnd.nodes = false
        nodesWriter.writeArray(
            nodesToWrite.map(elem => elemToJsonNode(elem) + '\n'),
            () => {
                writersEnd.nodes = true
                checkThreshold()
            }
        )
    }

    if (transactionsToWrite.length != 0) {
        writersEnd.transactions = false
        transactionsWriter.writeArray(
            transactionsToWrite.map(elem => elem + '\n'),
            () => {
                writersEnd.transactions = true
                checkThreshold()
            }
        )
    }

    checkThreshold()
}

function elemToJsonNode(elem) {
    const jsonData = {}
    jsonData['id'] = elem
    return JSON.stringify(jsonData)
}

function resetElemsToWrite() {
    nodesToWrite = []
    transactionsToWrite = []
}

function nextTempFile() {
    if (fileIndex < tempFiles.length) {
        nodesInitializer()
        tempInitializer(tempFiles[fileIndex])
        fileIndex++
        resetElemsToWrite()
        lastTempRead = false
        tempJson.nextLines()
    } else {
        console.log('all temp file scanned')
    }
}

nextTempFile()

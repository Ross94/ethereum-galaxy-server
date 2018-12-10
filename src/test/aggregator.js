const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const writer = require('./writer')
const reader = require('./reader')

const startTimer = require('./timer')
const timer = startTimer()

const nodesWriter = writer('nodes.json')
const transactionsWriter = writer('transactions.json')

//const path = "appoggio"
const path = 'temporary'
const tempFiles = getFiles(path).map(file => path + '/' + file)

var nodesJson = undefined
var tempJson = undefined

var nextFile = 0
var currentFile = -1
var nodesToWrite = new RBTree((a, b) => {
    return a.localeCompare(b)
})
var lastTempRead = false

function getFiles(filePath) {
    return require('fs').readdirSync(filePath)
}

function nodeParser(line) {
    const e = JSON.parse(line)
    return [e.id]
}

function nodesInitializer() {
    nodesJson = reader('nodes.json', nodeParser, (lines, options) => {
        _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

        if (options.endFile) {
            endTempBlock(() => {
                resetElemsToWrite()
                nodesInitializer()
                if (lastTempRead) {
                    console.log(
                        'duration of nodes extraction from ' +
                            tempFiles[currentFile] +
                            ': ' +
                            timer.printableHMS(timer.getTimeFromLast())
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
                console.log(
                    'duration of transactions copy from ' +
                        tempFiles[currentFile] +
                        ': ' +
                        timer.printableHMS(timer.getTimeFromLast())
                )
                cb()
            } else {
                transactionsWriter.writeArray(
                    lines.map(line => line + '\n'),
                    () => {
                        if (lastLine) {
                            console.log(
                                'duration of transactions copy from ' +
                                    tempFiles[currentFile] +
                                    ': ' +
                                    timer.printableHMS(timer.getTimeFromLast())
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
    console.log('start transactions copy from ' + tempFiles[currentFile])
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
        console.log('start node extraction of ' + tempFiles[currentFile])
        tempJson.nextLines()
    } else {
        console.log(
            'all temp files scanned total duration: ' +
                timer.printableHMS(timer.getTimeFromStart())
        )
    }
}

console.log('start files compact')
nextTempFile()

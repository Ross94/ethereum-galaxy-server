const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const execSync = require('child_process').execSync

const logger = require('./../../utilities/log')

const { checkResourceExists } = require('./../../utilities/utils')
const {
    graphNoLayoutTemporary,
    nodesPajekName,
    transactionsPajekName
} = require('./../../utilities/config')
const { compose } = require('./pajek-composer')

const writer = require('./../temp-writer')
const reader = require('./../temp-reader')

const path = graphNoLayoutTemporary()
const nodesPath = graphNoLayoutTemporary() + nodesPajekName()
const transactionsPath = graphNoLayoutTemporary() + transactionsPajekName()

function aggregate() {
    var nodesWriter
    var transactionsWriter

    var tempFiles

    var nodesPajek = undefined
    var tempPajek = undefined

    var nextFile = 0
    var currentFile = -1
    var nodesToWrite
    var lastTempRead = false
    var nextNodeID = checkResourceExists(nodesPath)
        ? parseInt(execSync('wc -l < ' + nodesPath).toString()) + 1
        : 1
    console.log(nextNodeID)

    logger.log('Start Pajek nodes and transactions aggregation')

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
        return line.split(' ')[1].replace(/"/g, '')
    }

    function nodesInitializer() {
        nodesPajek = reader(nodesPath, nodeParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

            if (options.endFile) {
                endTempBlock(() => {
                    resetElemsToWrite()
                    nodesInitializer()
                    if (lastTempRead) {
                        logger.log(
                            'Terminated Pajek nodes extraction from ' +
                                tempFiles[currentFile]
                        )
                        writeTransactions(() => {
                            nextTempFile()
                        })
                    } else {
                        tempPajek.nextLines()
                    }
                })
            } else {
                nodesPajek.nextLines()
            }
        })
    }

    function transactionParser(line) {
        const e = JSON.parse(line)
        return [e.source, e.target]
    }

    function tempInitializer(filepath) {
        tempPajek = reader(filepath, transactionParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
            if (options.endFile) {
                lastTempRead = true
            }
            nodesPajek.nextLines()
        })
    }

    function writeTransactions(cb) {
        var transactions = []
        var nodes = new RBTree((a, b) => {
            return a.key.localeCompare(b.key)
        })
        var lastLine = false
        var nodesCopyReader

        const transactionsCopyReader = reader(
            tempFiles[currentFile],
            line => {
                return JSON.parse(line)
            },
            (lines, options) => {
                transactions = _.flatten(lines)
                if (options.endFile) {
                    lastLine = true
                }
                nodesCopyReader = nodesInit()
                nodesCopyReader.nextLines()
            }
        )

        function nodesInit() {
            return reader(
                nodesPath,
                line => {
                    const parts = line.split(' ')
                    return {
                        key: parts[1].replace(/"/g, ''),
                        val: parseInt(parts[0])
                    }
                },
                (lines, options) => {
                    function getIndex(hashCode) {
                        if (typeof hashCode == 'string') {
                            const elem = nodes.find({ key: hashCode })
                            return elem != null ? elem.val : hashCode
                        }
                        return hashCode
                    }

                    nodes = new RBTree((a, b) => {
                        return a.key.localeCompare(b.key)
                    })
                    //convert transaction from json to pajek
                    lines.forEach(elem => nodes.insert(elem))
                    transactions = transactions.map(trans => {
                        trans.source = getIndex(trans.source)
                        trans.target = getIndex(trans.target)
                        if (
                            typeof trans.source == 'number' &&
                            typeof trans.target == 'number'
                        ) {
                            return (
                                trans.source +
                                ' ' +
                                trans.target +
                                ' "' +
                                trans.amount +
                                '"'
                            )
                        } else {
                            return trans
                        }
                    })

                    if (options.endFile) {
                        transactionsWriter.writeArray(
                            transactions.map(line => line + '\n'),
                            () => {
                                if (lastLine) {
                                    logger.log(
                                        'Termanited Pajek transactions copy from ' +
                                            tempFiles[currentFile]
                                    )
                                    cb()
                                } else {
                                    transactionsCopyReader.nextLines()
                                }
                            }
                        )
                    } else {
                        nodesCopyReader.nextLines()
                    }
                }
            )
        }

        logger.log(
            'Start Pajek transactions copy from ' + tempFiles[currentFile]
        )
        transactionsCopyReader.nextLines()
    }

    function endTempBlock(cb) {
        var writeNode = true

        function checkThreshold() {
            if (writeNode) {
                cb()
            }
        }

        function elemToPajekNode(elem) {
            const ret = nextNodeID + ' ' + '"' + elem + '"'
            nextNodeID++
            return ret
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
                app.map(elem => elemToPajekNode(elem) + '\n'),
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
                'Start Pajek node extraction of ' + tempFiles[currentFile]
            )
            tempPajek.nextLines()
        } else {
            logger.log('All temp files scanned for Pajek format')
            compose()
        }
    }
}

module.exports = {
    aggregate
}

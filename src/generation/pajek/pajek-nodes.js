const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const fs = require('fs')
const execSync = require('child_process').execSync

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const {
    graphNoLayoutTemporary,
    nodesPajekName
} = require('./../../utilities/config')
const { checkResourceExists } = require('./../../utilities/utils')

function pajekNodesAggregation(filePath, cb) {
    const nodesPath = graphNoLayoutTemporary() + nodesPajekName()

    const currentPajekFile = currentPajekInitializer()
    const nodesToWrite = new RBTree((a, b) => {
        return a.localeCompare(b)
    })

    var nodesPajek
    var lastTempRead = false
    var nextNodeID = checkResourceExists(nodesPath)
        ? parseInt(execSync('wc -l < ' + nodesPath).toString()) + 1
        : 1

    //check file exist if exist don't create new one or empty nodes created by splitter
    if (!checkResourceExists(nodesPath)) {
        //create file if doesn't exist, need if no previous download
        fs.closeSync(fs.openSync(nodesPath, 'w'))
    }
    nodesPajek = nodesInitializer()
    logger.log('Start Pajek node extraction of ' + filePath)
    currentPajekFile.nextLines()

    function nodeParser(line) {
        return line.split(' ')[1].replace(/"/g, '')
    }

    function nodesInitializer() {
        return reader(nodesPath, nodeParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

            if (options.endFile) {
                endCurrentPajekFileBlock(() => {
                    if (lastTempRead) {
                        logger.log(
                            'Terminated Pajek nodes extraction from ' + filePath
                        )
                        cb()
                    } else {
                        nodesPajek = nodesInitializer()
                        currentPajekFile.nextLines()
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

    function currentPajekInitializer() {
        return reader(filePath, transactionParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
            if (options.endFile) {
                lastTempRead = true
            }
            nodesPajek.nextLines()
        })
    }

    function endCurrentPajekFileBlock(cb) {
        const nodesWriter = writer(nodesPath)
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
}

module.exports = {
    pajekNodesAggregation
}

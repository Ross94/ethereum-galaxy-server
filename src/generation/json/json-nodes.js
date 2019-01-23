const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const fs = require('fs')

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const {
    graphNoLayoutTemporary,
    nodesJsonName
} = require('./../../utilities/config')
const { checkResourceExists } = require('./../../utilities/utils')

function jsonNodesAggregation(filePath, cb) {
    const nodesPath = graphNoLayoutTemporary() + nodesJsonName()

    const currentJsonFile = currentJsonInitializer()
    const nodesToWrite = new RBTree((a, b) => {
        return a.localeCompare(b)
    })

    var nodesJson
    var lastTempRead = false

    //check file exist if exist don't create new one or empty nodes created by splitter
    if (!checkResourceExists(nodesPath)) {
        //create file if doesn't exist, need if no previous download
        fs.closeSync(fs.openSync(nodesPath, 'w'))
    }
    nodesJson = nodesInitializer()
    logger.log('Start Json node extraction of ' + filePath)
    currentJsonFile.nextLines()

    function nodeParser(line) {
        const e = JSON.parse(line)
        return [e.id]
    }

    function nodesInitializer() {
        return reader(nodesPath, nodeParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

            if (options.endFile) {
                endCurrentJsonFileBlock(() => {
                    if (lastTempRead) {
                        logger.log(
                            'Terminated Json nodes extraction from ' + filePath
                        )
                        cb()
                    } else {
                        nodesJson = nodesInitializer()
                        currentJsonFile.nextLines()
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

    function currentJsonInitializer() {
        return reader(filePath, transactionParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
            if (options.endFile) {
                lastTempRead = true
            }
            nodesJson.nextLines()
        })
    }

    function endCurrentJsonFileBlock(cb) {
        const nodesWriter = writer(nodesPath)
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
}

module.exports = {
    jsonNodesAggregation
}

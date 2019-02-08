const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const fs = require('fs')

const FormatSettings = require('./../../utilities/settings/format-settings')
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GenerationProcessPhases = require('./../../shutdown/phases')
    .GenerationProcessPhases
const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')
const { checkResourceExists } = require('./../../utilities/utils')

nodesPath = ERRORS_MESSAGES.fieldError('abstract-nodes', 'nodesPath')

nodeParser = function(line) {
    throw ERRORS_MESSAGES.functionError('abstract-nodes', 'nodeParser')
}

elemToNode = function(elem) {
    throw ERRORS_MESSAGES.functionError('abstract-nodes', 'elemToNode')
}

function nodesAggregation(filePath, callback) {
    const nodesPath = module.exports.nodesPath

    const currentFile = currentFileInitializer()
    const nodesToWrite = new RBTree((a, b) => {
        return a.localeCompare(b)
    })

    var nodesFile
    var lastTempRead = false

    //check file exist if exist don't create new one or empty nodes created by splitter
    if (!checkResourceExists(nodesPath)) {
        //create file if doesn't exist, need if no previous download
        fs.closeSync(fs.openSync(nodesPath, 'w'))
    }
    nodesFile = nodesInitializer()
    logger.log(
        'Start ' +
            FormatSettings.getFormat() +
            ' node extraction of ' +
            filePath
    )
    currentFile.nextLines()

    function nodesInitializer() {
        return reader(
            nodesPath,
            GenerationProcessPhases.NodesPhase(),
            module.exports.nodeParser,
            (lines, options) => {
                _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

                if (options.endFile) {
                    endCurrentFileBlock(() => {
                        if (lastTempRead) {
                            logger.log(
                                'Terminated ' +
                                    FormatSettings.getFormat() +
                                    ' nodes extraction from ' +
                                    filePath
                            )
                            callback()
                        } else {
                            nodesFile = nodesInitializer()
                            currentFile.nextLines()
                        }
                    })
                } else {
                    nodesFile.nextLines()
                }
            }
        )
    }

    function transactionParser(line) {
        const e = JSON.parse(line)
        return [e.source, e.target]
    }

    function currentFileInitializer() {
        return reader(
            filePath,
            GenerationProcessPhases.NodesPhase(),
            transactionParser,
            (lines, options) => {
                _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
                if (options.endFile) {
                    lastTempRead = true
                }
                nodesFile.nextLines()
            }
        )
    }

    function endCurrentFileBlock(cb) {
        var writeNode = true

        function checkThreshold() {
            if (writeNode) {
                cb()
            }
        }

        if (nodesToWrite.size != 0) {
            writer(nodesPath, writer => {
                const nodesWriter = writer
                writeNode = false
                const app = []
                const it = nodesToWrite.iterator()
                var item
                while ((item = it.next()) !== null) {
                    app.push(item)
                }
                nodesWriter.writeArray(
                    app.map(elem => module.exports.elemToNode(elem) + '\n'),
                    () => {
                        writeNode = true
                        checkThreshold()
                    }
                )
            })
        } else {
            checkThreshold()
        }
    }
}

module.exports = {
    nodesPath,
    nodeParser,
    elemToNode,
    nodesAggregation
}

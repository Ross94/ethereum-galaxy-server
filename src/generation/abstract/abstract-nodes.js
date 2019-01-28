const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const fs = require('fs')

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const { checkResourceExists } = require('./../../utilities/utils')

format = 'override this field in another module'

nodesPath = 'override this field in another module'

nodeParser = function(line) {
    throw 'error, override this function in another module'
}

elemToNode = function(elem) {
    throw 'error, override this function in another module'
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
        'Start ' + module.exports.format + ' node extraction of ' + filePath
    )
    currentFile.nextLines()

    function nodesInitializer() {
        return reader(
            nodesPath,
            module.exports.nodeParser,
            (lines, options) => {
                _.flatten(lines).forEach(elem => nodesToWrite.remove(elem))

                if (options.endFile) {
                    endCurrentFileBlock(() => {
                        if (lastTempRead) {
                            logger.log(
                                'Terminated ' +
                                    module.exports.format +
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
        return reader(filePath, transactionParser, (lines, options) => {
            _.flatten(lines).forEach(elem => nodesToWrite.insert(elem))
            if (options.endFile) {
                lastTempRead = true
            }
            nodesFile.nextLines()
        })
    }

    function endCurrentFileBlock(cb) {
        var writeNode = true

        function checkThreshold() {
            if (writeNode) {
                cb()
            }
        }

        if (nodesToWrite.size != 0) {
            writer(nodesPath, w => {
                const nodesWriter = w
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
    format,
    nodesPath,
    nodeParser,
    elemToNode,
    nodesAggregation
}

const fs = require('fs')

const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')
const { checkResourceExists } = require('./../../utilities/utils')

format = 'override format field in another module'

path = {
    graphPath: 'override graphPath field in another module',
    tempPath: 'override tempPath field in another module',
    nodesPath: 'override nodesPath field in another module',
    transactionsPath: 'override transactionsPath field in another module'
}

nodesPhaseStart = function() {
    throw 'error, override nodesPhaseStart function in another module'
}

nodesPhaseLine = function(lines, hasLast, cb) {
    throw 'error, override nodesPhaseLine function in another module'
}

nodesPhaseEnd = function() {
    throw 'error, override nodesPhaseEnd function in another module'
}

transactionsPhaseStart = function() {
    throw 'error, override transactionsPhaseStart function in another module'
}

transactionsPhaseLine = function(lines, hasLast, cb) {
    throw 'error, override transactionsPhaseLine function in another module'
}

transactionsPhaseEnd = function() {
    throw 'error, override transactionsPhaseEnd function in another module'
}

function compose() {
    const graphPath = module.exports.path.graphPath
    const tempPath = module.exports.path.tempPath
    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    var lineReader
    var tempWriter

    if (checkResourceExists(tempPath)) {
        fs.unlinkSync(tempPath)
    }
    writer(tempPath, w => {
        tempWriter = w
        nodePhase()
    })

    function nodePhase() {
        lineReader = reader(
            nodesPath,
            line => {
                return line
            },
            (lines, options) => {
                const writableLines = module.exports.nodesPhaseLine(
                    lines,
                    options.endFile
                )
                tempWriter.writeArray(writableLines, () => {
                    if (options.endFile) {
                        tempWriter.write(module.exports.nodesPhaseEnd())

                        logger.log(
                            'End compact ' + module.exports.format + ' nodes'
                        )
                        transactionPhase()
                    } else {
                        lineReader.nextLines()
                    }
                })
            }
        )

        logger.log('Start compact ' + module.exports.format + ' nodes')
        tempWriter.write(module.exports.nodesPhaseStart())
        lineReader.nextLines()
    }

    function transactionPhase() {
        lineReader = reader(
            transactionsPath,
            line => {
                return line
            },
            (lines, options) => {
                const writableLines = module.exports.transactionsPhaseLine(
                    lines,
                    options.endFile
                )
                tempWriter.writeArray(writableLines, () => {
                    if (options.endFile) {
                        tempWriter.write(module.exports.transactionsPhaseEnd())

                        logger.log(
                            'End compact ' +
                                module.exports.format +
                                ' transactions'
                        )
                        if (checkResourceExists(graphPath)) {
                            fs.unlinkSync(graphPath)
                        }
                        fs.renameSync(tempPath, graphPath)
                        //communicate to master end generation
                        process.send({
                            pid: process.pid,
                            command: 'end'
                        })
                    } else {
                        lineReader.nextLines()
                    }
                })
            }
        )

        logger.log('Start compact ' + module.exports.format + ' transactions')
        tempWriter.write(module.exports.transactionsPhaseStart())
        lineReader.nextLines()
    }
}

module.exports = {
    format,
    path,
    nodesPhaseStart,
    nodesPhaseLine,
    nodesPhaseEnd,
    transactionsPhaseStart,
    transactionsPhaseLine,
    transactionsPhaseEnd,
    compose
}

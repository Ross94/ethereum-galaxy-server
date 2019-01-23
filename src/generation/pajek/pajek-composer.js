const fs = require('fs')
const execSync = require('child_process').execSync

const logger = require('./../../utilities/log')
const { checkResourceExists } = require('./../../utilities/utils')
const {
    nodesPajekName,
    transactionsPajekName,
    graphNoLayoutTemporary,
    pajekGraphName
} = require('./../../utilities/config')

const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

const graphPath = graphNoLayoutTemporary() + pajekGraphName()
const tempPath = graphNoLayoutTemporary() + 'temp.net'
const nodePath = graphNoLayoutTemporary() + nodesPajekName()
const transactionPath = graphNoLayoutTemporary() + transactionsPajekName()

function compose() {
    const pajekLines = {
        vertices: '*Vertices ' + execSync('wc -l < ' + nodePath),
        arcs: '*arcs'
    }

    var tempWriter
    var lineReader

    if (checkResourceExists(tempPath)) {
        fs.unlinkSync(tempPath)
    }

    tempWriter = writer(tempPath)
    lineReader = createReader(nodePath)

    tempWriter.write(pajekLines.vertices)
    nodePhase()

    function createReader(filepath) {
        return require('readline').createInterface({
            input: require('fs').createReadStream(filepath)
        })
    }

    function writeLine(line) {
        tempWriter.write(line + '\n')
    }

    function nodePhase() {
        logger.log('Start compact Pajek nodes')
        lineReader
            .on('line', function(line) {
                writeLine(line)
            })
            .on('close', function() {
                logger.log('End compact Pajek nodes')
                tempWriter.write(pajekLines.arcs + '\n')
                transactionPhase()
            })
    }

    function transactionPhase() {
        logger.log('Start compact Pajek transactions')
        lineReader = createReader(transactionPath)
        lineReader
            .on('line', function(line) {
                writeLine(line)
            })
            .on('close', function() {
                logger.log('End compact Pajek transactions')
                if (checkResourceExists(graphPath)) {
                    fs.unlinkSync(graphPath)
                }
                fs.renameSync(tempPath, graphPath)
                //communicate to master end generation
                process.send({
                    pid: process.pid,
                    command: 'end'
                })
            })
    }
}

module.exports = {
    compose
}

const execSync = require('child_process').execSync
const abstractComposer = require('./../abstract/abstract-composer')
const {
    nodesPajekName,
    transactionsPajekName,
    graphNoLayoutTemporary,
    pajekGraphName
} = require('./../../utilities/config')

function compose() {
    const graphPath = graphNoLayoutTemporary() + pajekGraphName()
    const tempPath = graphNoLayoutTemporary() + 'pajekTemp.net'
    const nodesPath = graphNoLayoutTemporary() + nodesPajekName()
    const transactionsPath = graphNoLayoutTemporary() + transactionsPajekName()

    const pajekLines = {
        vertices: '*Vertices ' + execSync('wc -l < ' + nodesPath),
        arcs: '*arcs'
    }

    abstractComposer.format = 'Pajek'

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return pajekLines.vertices
    }

    abstractComposer.nodesPhaseLine = function(lines, hasLast) {
        return pajekConverter(lines)
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return pajekLines.arcs + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(lines, hasLast) {
        return pajekConverter(lines)
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return ''
    }

    function pajekConverter(lines) {
        return lines.map(elem => writableLine(elem))
    }

    function writableLine(line) {
        return line + '\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}

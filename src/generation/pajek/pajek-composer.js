const execSync = require('child_process').execSync
const abstractComposer = require('./../abstract/abstract-composer')
const PajekNameConstants = require('./../../utilities/constants/files-name-constants')
    .PajekNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function compose() {
    const graphPath =
        NoLayoutConstants.graphNoLayoutTemporary +
        PajekNameConstants.pajekGraphName
    const tempPath =
        NoLayoutConstants.graphNoLayoutTemporary +
        PajekNameConstants.tempPajekName
    const nodesPath =
        NoLayoutConstants.graphNoLayoutTemporary +
        PajekNameConstants.nodesPajekName
    const transactionsPath =
        NoLayoutConstants.graphNoLayoutTemporary +
        PajekNameConstants.transactionsPajekName

    const pajekLines = {
        vertices: '*Vertices ' + execSync('wc -l < ' + nodesPath),
        arcs: '*arcs'
    }

    abstractComposer.format = PajekNameConstants.pajekFormat

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

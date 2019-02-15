const execSync = require('child_process').execSync
const abstractComposer = require('./../abstract/abstract-composer')
const PajekNameConstants = require('./../../utilities/constants/files-name-constants')
    .PajekNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function compose() {
    const graphPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekGraphFilename()

    const tempPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekTempFilename()

    const nodesPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekNodesFilename()

    const transactionsPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekTransactionsFilename()

    const pajekLines = {
        vertices: '*Vertices ' + execSync('wc -l < ' + nodesPath),
        arcs: '*arcs'
    }

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return pajekLines.vertices
    }

    abstractComposer.nodesPhaseLine = function(line, hasLast) {
        return writableLine(line)
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return pajekLines.arcs + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(line, hasLast) {
        return writableLine(line)
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return ''
    }

    function writableLine(line) {
        return line + '\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}

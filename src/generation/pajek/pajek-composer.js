const execSync = require('child_process').execSync
const abstractComposer = require('./../abstract/abstract-composer')
const writer = require('./../temp-writer')
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

    abstractComposer.nodesPhaseLine = function(lines, hasLast, cb) {
        const wLines = []
        //map lines in writable form
        for (var i = 0; i < lines.length; i++) {
            if (hasLast && i == lines.length - 1) {
                wLines.push(writableLine(lines[i]))
            } else {
                wLines.push(writableLine(lines[i]))
            }
        }
        return wLines
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return pajekLines.arcs + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(lines, hasLast, cb) {
        const wLines = []
        //map lines in writable form
        for (var i = 0; i < lines.length; i++) {
            if (hasLast && i == lines.length - 1) {
                wLines.push(writableLine(lines[i]))
            } else {
                wLines.push(writableLine(lines[i]))
            }
        }
        return wLines
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

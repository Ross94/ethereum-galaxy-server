const abstractComposer = require('./../abstract/abstract-composer')
const writer = require('./../temp-writer')
const {
    nodesJsonName,
    transactionsJsonName,
    graphNoLayoutTemporary,
    jsonGraphName
} = require('./../../utilities/config')

function compose() {
    const graphPath = graphNoLayoutTemporary() + jsonGraphName()
    const tempPath = graphNoLayoutTemporary() + 'jsonTemp.json'
    const nodesPath = graphNoLayoutTemporary() + nodesJsonName()
    const transactionsPath = graphNoLayoutTemporary() + transactionsJsonName()

    const jsonLines = {
        open: '{"nodes":[',
        mid: '],"links":[',
        close: ']}'
    }

    var l = undefined

    abstractComposer.format = 'Json'

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return jsonLines.open + '\n'
    }

    abstractComposer.nodesPhaseLine = function(lines, hasLast, cb) {
        const wLines = []
        //map lines in writable form
        for (var i = 0; i < lines.length; i++) {
            if (hasLast && i == lines.length - 1) {
                wLines.push(lastLine(lines[i]))
            } else {
                wLines.push(commonLine(lines[i]))
            }
        }
        return wLines
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return '\t' + jsonLines.mid + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(lines, hasLast, cb) {
        const wLines = []
        //map lines in writable form
        for (var i = 0; i < lines.length; i++) {
            if (hasLast && i == lines.length - 1) {
                wLines.push(lastLine(lines[i]))
            } else {
                wLines.push(commonLine(lines[i]))
            }
        }
        return wLines
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return jsonLines.close + '\n'
    }

    function commonLine(line) {
        return '\t\t' + line + ',\n'
    }

    function lastLine(line) {
        return '\t\t' + line + '\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}

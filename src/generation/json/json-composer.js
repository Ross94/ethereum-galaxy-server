const abstractComposer = require('./../abstract/abstract-composer')
const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function compose() {
    const graphPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        JsonNameConstants.jsonGraphFilename()

    const tempPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        JsonNameConstants.jsonTempFilename()

    const nodesPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        JsonNameConstants.jsonNodesFilename()

    const transactionsPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        JsonNameConstants.jsonTransactionsFilename()

    const jsonLines = {
        open: '{"nodes":[',
        mid: '],"links":[',
        close: ']}'
    }

    var l = undefined

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return jsonLines.open + '\n'
    }

    abstractComposer.nodesPhaseLine = function(line, hasLast) {
        return jsonConverter(line, hasLast)
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return '\t' + jsonLines.mid + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(line, hasLast) {
        return jsonConverter(line, hasLast)
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return jsonLines.close + '\n'
    }

    function jsonConverter(line, hasLast) {
        if (hasLast) {
            return '\t\t' + line + '\n'
        }
        return '\t\t' + line + ',\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}

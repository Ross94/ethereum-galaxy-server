const abstractNodes = require('./../abstract/abstract-nodes')
const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function jsonNodesAggregation(filePath, cb) {
    abstractNodes.format = JsonNameConstants.jsonFormat

    abstractNodes.nodesPath =
        NoLayoutConstants.graphNoLayoutTemporary +
        JsonNameConstants.nodesJsonName

    abstractNodes.nodeParser = function(line) {
        const e = JSON.parse(line)
        return [e.id]
    }

    abstractNodes.elemToNode = function(elem) {
        const jsonData = {}
        jsonData['id'] = elem
        return JSON.stringify(jsonData)
    }

    abstractNodes.nodesAggregation(filePath, cb)
}

module.exports = {
    jsonNodesAggregation
}

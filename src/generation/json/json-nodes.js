const abstractNodes = require('./../abstract/abstract-nodes')
const {
    graphNoLayoutTemporary,
    nodesJsonName
} = require('./../../utilities/config')

function jsonNodesAggregation(filePath, cb) {
    abstractNodes.format = 'Json'

    abstractNodes.nodesPath = graphNoLayoutTemporary() + nodesJsonName()

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

const abstractNodes = require('./../abstract/abstract-nodes')
const {
    graphNoLayoutTemporary,
    nodesJsonName
} = require('./../../utilities/config')

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

function jsonNodesAggregation(filePath, cb) {
    abstractNodes.nodesAggregation(filePath, cb)
}

module.exports = {
    jsonNodesAggregation
}

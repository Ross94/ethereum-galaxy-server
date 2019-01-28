const abstractNodes = require('./../abstract/abstract-nodes')
const execSync = require('child_process').execSync
const {
    graphNoLayoutTemporary,
    nodesPajekName
} = require('./../../utilities/config')
const { checkResourceExists } = require('./../../utilities/utils')

const nodesPath = graphNoLayoutTemporary() + nodesPajekName()
var nextNodeID

abstractNodes.format = 'Pajek'

abstractNodes.nodesPath = nodesPath

abstractNodes.nodeParser = function(line) {
    return line.split(' ')[1].replace(/"/g, '')
}

abstractNodes.elemToNode = function(elem) {
    const ret = nextNodeID + ' ' + '"' + elem + '"'
    nextNodeID++
    return ret
}

function pajekNodesAggregation(filePath, cb) {
    /*initialize here, if initialized outside, loaded when program start, nodesPath doesn't exist and value is alway 1
    in executons after the first is a bug*/
    nextNodeID = checkResourceExists(nodesPath)
        ? parseInt(execSync('wc -l < ' + nodesPath).toString()) + 1
        : 1

    abstractNodes.nodesAggregation(filePath, cb)
}

module.exports = {
    pajekNodesAggregation
}

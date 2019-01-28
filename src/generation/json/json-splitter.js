const abstractSplitter = require('./../abstract/abstract-splitter')
const { aggregate } = require('./json-aggregator')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    nodesJsonName,
    transactionsJsonName
} = require('./../../utilities/config')

abstractSplitter.path = {
    graphPath: graphNoLayoutTemporary() + jsonGraphName(),
    nodePath: graphNoLayoutTemporary() + nodesJsonName(),
    transactionPath: graphNoLayoutTemporary() + transactionsJsonName()
}

abstractSplitter.format = 'Json'

abstractSplitter.parser = function(line) {
    try {
        var type = 'error'

        const parsableElem =
            line[line.length - 1] === ',' ? line.slice(0, -1) : line
        const data = JSON.parse(parsableElem)
        if (data.id != undefined) {
            type = abstractSplitter.TYPE.node
        } else if (data.source != undefined) {
            type = abstractSplitter.TYPE.transaction
        }
        return {
            type: type,
            data: JSON.stringify(data) + '\n'
        }
    } catch (err) {
        //here will be some lines of json utilities (ex. {"nodes":[)
        return {
            type: 'error',
            data: undefined
        }
    }
}

abstractSplitter.aggregate = function() {
    aggregate()
}

function split() {
    abstractSplitter.split()
}

module.exports = {
    split
}

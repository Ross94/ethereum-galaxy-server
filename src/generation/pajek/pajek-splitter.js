const abstractSplitter = require('./../abstract/abstract-splitter')
const { aggregate } = require('./pajek-aggregator')
const {
    graphNoLayoutAll,
    graphNoLayoutTemporary,
    pajekGraphName,
    nodesPajekName,
    transactionsPajekName
} = require('./../../utilities/config')

function split() {
    abstractSplitter.path = {
        graphPath: graphNoLayoutAll() + pajekGraphName(),
        nodePath: graphNoLayoutTemporary() + nodesPajekName(),
        transactionPath: graphNoLayoutTemporary() + transactionsPajekName()
    }

    abstractSplitter.format = 'Pajek'

    abstractSplitter.parser = function(line) {
        var type = 'error'
        var data = undefined
        if (!line.includes('*')) {
            if (line.split(' ').length == 2) {
                type = abstractSplitter.TYPE.node
            } else if (line.split(' ').length == 3) {
                type = abstractSplitter.TYPE.transaction
            }
            data = line + '\n'
        }
        return {
            type: type,
            data: data
        }
    }

    abstractSplitter.aggregate = function() {
        aggregate()
    }

    abstractSplitter.split()
}

module.exports = {
    split
}

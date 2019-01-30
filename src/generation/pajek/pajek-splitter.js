const abstractSplitter = require('./../abstract/abstract-splitter')
const { aggregate } = require('./pajek-aggregator')
const PajekNameConstants = require('./../../utilities/constants/files-name-constants')
    .PajekNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function split() {
    abstractSplitter.path = {
        graphPath:
            NoLayoutConstants.graphNoLayoutAll +
            PajekNameConstants.pajekGraphName,
        nodePath:
            NoLayoutConstants.graphNoLayoutTemporary +
            PajekNameConstants.nodesPajekName,
        transactionPath:
            NoLayoutConstants.graphNoLayoutTemporary +
            PajekNameConstants.transactionsPajekName
    }

    abstractSplitter.format = PajekNameConstants.pajekFormat

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

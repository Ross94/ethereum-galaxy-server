const abstractSplitter = require('./../abstract/abstract-splitter')
const { aggregate } = require('./json-aggregator')
const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function split() {
    abstractSplitter.path = {
        graphPath:
            NoLayoutConstants.graphNoLayoutAll +
            JsonNameConstants.jsonGraphName,
        nodePath:
            NoLayoutConstants.graphNoLayoutTemporary +
            JsonNameConstants.nodesJsonName,
        transactionPath:
            NoLayoutConstants.graphNoLayoutTemporary +
            JsonNameConstants.transactionsJsonName
    }

    abstractSplitter.format = JsonNameConstants.jsonFormat

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

    abstractSplitter.split()
}

module.exports = {
    split
}

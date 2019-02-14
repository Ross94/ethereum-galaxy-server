const abstractTransactions = require('./../abstract/abstract-transactions')
const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function jsonTransactionsAggregation(filePath, cb) {
    abstractTransactions.path = {
        nodesPath:
            NoLayoutConstants.noLayoutTemporaryPath() +
            JsonNameConstants.jsonNodesFilename(),

        transactionsPath:
            NoLayoutConstants.noLayoutTemporaryPath() +
            JsonNameConstants.jsonTransactionsFilename()
    }

    abstractTransactions.nodeFileParser = function(line) {
        return { key: line }
    }

    abstractTransactions.tempFileParser = function(line) {
        return line
    }

    abstractTransactions.transactionConverter = function(transaction, nodes) {
        return transaction
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    jsonTransactionsAggregation
}

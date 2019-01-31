const abstractTransactions = require('./../abstract/abstract-transactions')
const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function jsonTransactionsAggregation(filePath, cb) {
    abstractTransactions.format = JsonNameConstants.jsonFormat

    abstractTransactions.path = {
        nodesPath:
            NoLayoutConstants.graphNoLayoutTemporary +
            JsonNameConstants.jsonNodesFilename,
        transactionsPath:
            NoLayoutConstants.graphNoLayoutTemporary +
            JsonNameConstants.jsonTransactionsFilename
    }

    abstractTransactions.nodeFileParser = function(line) {
        return line
    }

    abstractTransactions.tempFileParser = function(line) {
        return line
    }

    abstractTransactions.transactionConverter = function(lines, transactions) {
        return transactions
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    jsonTransactionsAggregation
}

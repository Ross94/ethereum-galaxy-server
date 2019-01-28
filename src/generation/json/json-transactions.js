const abstractTransactions = require('./../abstract/abstract-transactions')

const {
    graphNoLayoutTemporary,
    nodesJsonName,
    transactionsJsonName
} = require('./../../utilities/config')

function jsonTransactionsAggregation(filePath, cb) {
    abstractTransactions.format = 'Json'

    abstractTransactions.path = {
        nodesPath: graphNoLayoutTemporary() + nodesJsonName(),
        transactionsPath: graphNoLayoutTemporary() + transactionsJsonName()
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

const abstractTransactions = require('./../abstract/abstract-transactions')
const PajekNameConstants = require('./../../utilities/constants/files-name-constants')
    .PajekNameConstants
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants

function pajekTransactionsAggregation(filePath, cb) {
    const nodesPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekNodesFilename()

    const transactionsPath =
        NoLayoutConstants.noLayoutTemporaryPath() +
        PajekNameConstants.pajekTransactionsFilename()

    abstractTransactions.path = {
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractTransactions.nodeFileParser = function(line) {
        const parts = line.split(' ')
        return {
            key: parts[1].replace(/"/g, ''),
            val: parseInt(parts[0])
        }
    }

    abstractTransactions.tempFileParser = function(line) {
        return JSON.parse(line)
    }

    abstractTransactions.transactionConverter = function(transaction, nodes) {
        function getIndex(hashCode) {
            if (typeof hashCode == 'string') {
                const elem = nodes.find({ key: hashCode })
                return elem != null ? elem.val : hashCode
            }
            return hashCode
        }

        transaction.source = getIndex(transaction.source)
        transaction.target = getIndex(transaction.target)
        if (
            typeof transaction.source == 'number' &&
            typeof transaction.target == 'number'
        ) {
            return (
                transaction.source +
                ' ' +
                transaction.target +
                ' "' +
                transaction.amount +
                '"'
            )
        } else {
            return transaction
        }
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    pajekTransactionsAggregation
}

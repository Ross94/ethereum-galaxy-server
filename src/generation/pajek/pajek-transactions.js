const abstractTransactions = require('./../abstract/abstract-transactions')
const RBTree = require('bintrees').RBTree
const {
    graphNoLayoutTemporary,
    nodesPajekName,
    transactionsPajekName
} = require('./../../utilities/config')

function pajekTransactionsAggregation(filePath, cb) {
    const nodesPath = graphNoLayoutTemporary() + nodesPajekName()
    const transactionsPath = graphNoLayoutTemporary() + transactionsPajekName()

    abstractTransactions.format = 'Pajek'

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

    abstractTransactions.transactionConverter = function(lines, transactions) {
        const nodes = new RBTree((a, b) => {
            return a.key.localeCompare(b.key)
        })

        function getIndex(hashCode) {
            if (typeof hashCode == 'string') {
                const elem = nodes.find({ key: hashCode })
                return elem != null ? elem.val : hashCode
            }
            return hashCode
        }

        //convert transaction from json to pajek
        lines.forEach(elem => nodes.insert(elem))
        return transactions.map(trans => {
            trans.source = getIndex(trans.source)
            trans.target = getIndex(trans.target)
            if (
                typeof trans.source == 'number' &&
                typeof trans.target == 'number'
            ) {
                return (
                    trans.source +
                    ' ' +
                    trans.target +
                    ' "' +
                    trans.amount +
                    '"'
                )
            } else {
                return trans
            }
        })
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    pajekTransactionsAggregation
}

const abstractAggregator = require('./../abstract/abstract-aggregator')

const { pajekNodesAggregation } = require('./pajek-nodes')
const { pajekTransactionsAggregation } = require('./pajek-transactions')
const { compose } = require('./pajek-composer')

abstractAggregator.format = 'Pajek'

abstractAggregator.nodesAggregation = function(filepath, cb) {
    pajekNodesAggregation(filepath, cb)
}

abstractAggregator.transactionsAggregation = function(filepath, cb) {
    pajekTransactionsAggregation(filepath, cb)
}

abstractAggregator.compose = function() {
    compose()
}

function aggregate() {
    abstractAggregator.aggregate()
}

module.exports = {
    aggregate
}

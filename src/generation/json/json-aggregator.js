const abstractAggregator = require('./../abstract/abstract-aggregator')

const JsonNameConstants = require('./../../utilities/constants/files-name-constants')
    .JsonNameConstants
const { jsonNodesAggregation } = require('./json-nodes')
const { jsonTransactionsAggregation } = require('./json-transactions')
const { compose } = require('./json-composer')

function aggregate() {
    abstractAggregator.format = JsonNameConstants.jsonFormat

    abstractAggregator.nodesAggregation = function(filepath, cb) {
        jsonNodesAggregation(filepath, cb)
    }

    abstractAggregator.transactionsAggregation = function(filepath, cb) {
        jsonTransactionsAggregation(filepath, cb)
    }

    abstractAggregator.compose = function() {
        compose()
    }

    abstractAggregator.aggregate()
}

module.exports = {
    aggregate
}

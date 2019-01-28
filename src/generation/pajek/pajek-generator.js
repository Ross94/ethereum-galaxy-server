const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./pajek-splitter')
const { aggregate } = require('./pajek-aggregator')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess()

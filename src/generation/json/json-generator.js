const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess()

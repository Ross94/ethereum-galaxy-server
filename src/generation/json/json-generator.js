const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')
const FormatSettings = require('./../../utilities/settings/format-settings')

FormatSettings.setFormat('Json')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess()

const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./pajek-splitter')
const { aggregate } = require('./pajek-aggregator')
const FormatSettings = require('./../../utilities/settings/format-settings')

FormatSettings.setFormat('Pajek')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess()

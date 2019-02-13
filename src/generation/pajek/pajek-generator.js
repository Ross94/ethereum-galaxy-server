const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./pajek-splitter')
const { aggregate } = require('./pajek-aggregator')
const FormatNamesConstants = require('./../../utilities/constants/files-name-constants')
    .FormatNamesConstants

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess(FormatNamesConstants.pajekFormat())

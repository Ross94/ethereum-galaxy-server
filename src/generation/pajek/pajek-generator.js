const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./pajek-splitter')
const { aggregate } = require('./pajek-aggregator')
const { compose } = require('./pajek-composer')
const FormatNamesConstants = require('./../../utilities/constants/files-name-constants')
    .FormatNamesConstants

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.compose = function() {
    compose()
}

abstractGenerator.startProcess(FormatNamesConstants.pajekFormat())

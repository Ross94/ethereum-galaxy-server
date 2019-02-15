const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')
const { compose } = require('./json-composer')
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

abstractGenerator.startProcess(FormatNamesConstants.jsonFormat())

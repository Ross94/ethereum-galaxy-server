const abstractGenerator = require('./../abstract/abstract-generator')
const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')
const FormatNamesConstants = require('./../../utilities/constants/files-name-constants')
    .FormatNamesConstants

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.startProcess(FormatNamesConstants.jsonFormat())

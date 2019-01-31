const logger = require('./../../utilities/log')
const NoLayoutConstants = require('./../../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES

format = ERRORS_MESSAGES.fieldError('abstract-aggregator', 'format')

nodesAggregation = function(filepath, cb) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-aggregator',
        'nodesAggregation'
    )
}

transactionsAggregation = function(filepath, cb) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-aggregator',
        'transactionsAggregation'
    )
}

compose = function() {
    throw ERRORS_MESSAGES.functionError('abstract-aggregator', 'compose')
}

function aggregate() {
    const tempFilesFolderPath = NoLayoutConstants.noLayoutTemporaryPath()
    const tempFiles = require('fs')
        .readdirSync(tempFilesFolderPath)
        .filter(file => filterFiles(file))
        .map(file => tempFilesFolderPath + file)

    var nextFile = 0
    var currentFile = -1

    logger.log(
        'Start ' + module.exports.format + ' nodes and transactions aggregation'
    )
    nextTempFile()

    function filterFiles(file) {
        const folders = file.split('/')
        const part = folders[folders.length - 1].split('.')
        if (!isNaN(parseInt(part[0])) && part[1].localeCompare('json') == 0) {
            return true
        }
        return false
    }

    function nextTempFile() {
        if (nextFile < tempFiles.length) {
            currentFile = nextFile
            nextFile++
            module.exports.nodesAggregation(tempFiles[currentFile], () => {
                module.exports.transactionsAggregation(
                    tempFiles[currentFile],
                    () => {
                        nextTempFile()
                    }
                )
            })
        } else {
            logger.log(
                'All temp files scanned for ' +
                    module.exports.format +
                    ' format'
            )
            module.exports.compose()
        }
    }
}

module.exports = {
    format,
    nodesAggregation,
    transactionsAggregation,
    compose,
    aggregate
}

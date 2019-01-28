const logger = require('./../../utilities/log')
const { graphNoLayoutTemporary } = require('./../../utilities/config')

format = 'override this field in another module'

nodesAggregation = function(filepath, cb) {
    throw 'error, override this function in another module'
}

transactionsAggregation = function(filepath, cb) {
    throw 'error, override this function in another module'
}

compose = function() {
    throw 'error, override this function in another module'
}

function aggregate() {
    const tempFilesFolderPath = graphNoLayoutTemporary()
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

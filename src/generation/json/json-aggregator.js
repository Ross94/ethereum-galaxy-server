const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const logger = require('./../../utilities/log')

const writer = require('./../temp-writer')
const reader = require('./../temp-reader')
const { graphNoLayoutTemporary } = require('./../../utilities/config')
const { jsonNodesAggregation } = require('./json-nodes')
const { jsonTransactionsAggregation } = require('./json-transactions')
const { compose } = require('./json-composer')

function aggregate() {
    const tempFilesFolderPath = graphNoLayoutTemporary()
    const tempFiles = require('fs')
        .readdirSync(tempFilesFolderPath)
        .filter(file => filterFiles(file))
        .map(file => tempFilesFolderPath + file)

    var nextFile = 0
    var currentFile = -1

    logger.log('Start Json nodes and transactions aggregation')
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
            jsonNodesAggregation(tempFiles[currentFile], () => {
                jsonTransactionsAggregation(tempFiles[currentFile], () => {
                    nextTempFile()
                })
            })
        } else {
            logger.log('All temp files scanned for Json format')
            compose()
        }
    }
}

module.exports = {
    aggregate
}

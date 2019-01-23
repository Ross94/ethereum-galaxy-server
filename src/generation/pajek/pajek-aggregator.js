const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const logger = require('./../../utilities/log')

const writer = require('./../temp-writer')
const reader = require('./../temp-reader')
const { graphNoLayoutTemporary } = require('./../../utilities/config')
const { pajekNodesAggregation } = require('./pajek-nodes')
const { pajekTransactionsAggregation } = require('./pajek-transactions')
const { compose } = require('./pajek-composer')

function aggregate() {
    const tempFilesFolderPath = graphNoLayoutTemporary()
    const tempFiles = require('fs')
        .readdirSync(tempFilesFolderPath)
        .filter(file => filterFile(file))
        .map(file => tempFilesFolderPath + file)

    var nextFile = 0
    var currentFile = -1

    logger.log('Start Pajek nodes and transactions aggregation')
    nextTempFile()

    function filterFile(file) {
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
            pajekNodesAggregation(tempFiles[currentFile], () => {
                pajekTransactionsAggregation(tempFiles[currentFile], () => {
                    nextTempFile()
                })
            })
        } else {
            logger.log('All temp files scanned for Pajek format')
            compose()
        }
    }
}

module.exports = {
    aggregate
}

const NoLayoutConstants = require('./no-layout-constants').NoLayoutConstants

const GlobalNameConstants = Object.freeze({
    globalFormat: () => 'common',
    infoFilename: () => 'info.json',
    runningFilename: () => NoLayoutConstants.noLayoutPath() + 'running.json'
})

const PajekNameConstants = Object.freeze({
    pajekTempFilename: () => 'pajekTemp.net',
    pajekNodesFilename: () => 'nodes.net',
    pajekTransactionsFilename: () => 'transactions.net',
    pajekGraphFilename: () => 'graph.net'
})

const JsonNameConstants = Object.freeze({
    jsonTempFilename: () => 'jsonTemp.json',
    jsonNodesFilename: () => 'nodes.json',
    jsonTransactionsFilename: () => 'transactions.json',
    jsonGraphFilename: () => 'graph.json'
})

const FormatNamesConstants = Object.freeze({
    jsonFormat: () => 'Json',
    pajekFormat: () => 'Pajek'
})

module.exports = {
    GlobalNameConstants,
    PajekNameConstants,
    JsonNameConstants,
    FormatNamesConstants
}

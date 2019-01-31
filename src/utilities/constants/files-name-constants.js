const GlobalNameConstants = Object.freeze({
    globalFormat: 'common',
    infoFilename: 'info.json'
})

const PajekNameConstants = Object.freeze({
    pajekFormat: 'Pajek',
    pajekTempFilename: 'pajekTemp.net',
    pajekNodesFilename: 'nodes.net',
    pajekTransactionsFilename: 'transactions.net',
    pajekGraphFilename: 'graph.net'
})

const JsonNameConstants = Object.freeze({
    jsonFormat: 'Json',
    jsonTempFilename: 'jsonTemp.json',
    jsonNodesFilename: 'nodes.json',
    jsonTransactionsFilename: 'transactions.json',
    jsonGraphFilename: 'graph.json'
})

module.exports = {
    GlobalNameConstants,
    PajekNameConstants,
    JsonNameConstants
}

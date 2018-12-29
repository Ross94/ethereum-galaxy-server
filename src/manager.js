const retrieverSetKey = require('./block-retriever')
const downloadType = require('./enum').DOWNLOAD_TYPE
const logger = require('./log')
const master = require('./task-master')
const constraints = require('./constraints')
const {
    logNoLayoutAll,
    logNoLayoutTime,
    logNoLayoutBlock,
    graphNoLayoutAll,
    graphNoLayoutTime,
    graphNoLayoutBlock
} = require('./config')

var blocks
var api

module.exports = (infuraApiKey, dlType, params) => {
    api = infuraApiKey
    retriever = retrieverSetKey(infuraApiKey)

    switch (dlType) {
        case downloadType.TIME:
            constraints.setSaveFolder(graphNoLayoutTime())
            logger.setPath(
                logNoLayoutTime() +
                    params.firstDate +
                    '-' +
                    params.lastDate +
                    '.log'
            )
            logger.log(
                'Log of time type with firstDate: ' +
                    params.firstDate +
                    ' lastDate: ' +
                    params.lastDate
            )
            retriever
                .dateToBlocks({
                    firstDate: params.firstDate,
                    lastDate: params.lastDate
                })
                .then(res => {
                    blocks = res
                    phase1()
                })
            break
        case downloadType.BLOCK:
            constraints.setSaveFolder(graphNoLayoutBlock())
            logger.setPath(
                logNoLayoutBlock() +
                    params.firstBlock +
                    '-' +
                    params.lastBlock +
                    '.log'
            )
            logger.log(
                'Log of block type with firstBlock: ' +
                    params.firstBlock +
                    ' lastBlock: ' +
                    params.lastBlock
            )
            blocks = {
                first: parseInt(params.firstBlock),
                last: parseInt(params.lastBlock)
            }
            phase1()
            break
        case downloadType.ALL:
            constraints.setSaveFolder(graphNoLayoutAll())
            logger.setPath(logNoLayoutAll() + 'all' + '.log')
            logger.log('Log of all type')
            retriever.allToBlocks().then(res => {
                blocks = res
                phase1()
            })
            break
    }
}

function phase1() {
    const workers = master(parseInt(blocks.first), parseInt(blocks.last))
    workers.startWorkers(api)
}

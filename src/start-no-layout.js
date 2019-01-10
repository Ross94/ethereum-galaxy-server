const fs = require('fs')
const argv = require('named-argv')
const createEth = require('./eth')
const { dateComparator } = require('./utils')
const constraints = require('./constraints')
const master = require('./downloader-master')
const logger = require('./log')
const retrieverSetKey = require('./block-retriever')
const { checkResourceExists } = require('./utils')
const { saveInfo } = require('./files')
const { split } = require('./splitter')
const {
    logNoLayoutAll,
    logNoLayoutTime,
    logNoLayoutBlock,
    graphNoLayoutAll,
    graphNoLayoutTime,
    graphNoLayoutBlock,
    graphNoLayoutTemporary,
    infoName,
    jsonGraphName
} = require('./config')

const params = argv.opts

var time = 0
var block = 0
var all = 0

var eth
var api

function main() {
    if (params.api != undefined) {
        if (!isNaN(parseInt(params.memory))) {
            constraints.setMemory(parseInt(params.memory))
        }
        api = params.api
        const retriever = retrieverSetKey(api)

        eth = createEth(params.api)
        eth.lastBlock().then(lastBlock => {
            //in this part check params and select the method to extract indexes
            if (
                checkDateFormat(params.firstDate) &&
                checkDateFormat(params.lastDate) &&
                dateComparator(params.firstDate, params.lastDate) >= 0
            ) {
                time = 1
            }
            if (
                params.firstBlock >= 0 &&
                params.lastBlock <= lastBlock &&
                params.lastBlock > params.firstBlock
            ) {
                block = 1
            }
            if (params.all) {
                all = 1
            }
            if (time + block + all != 1) {
                console.log(
                    'Wrong params, choose one of these:\n' +
                        '-firstBlock:int -lastBlock:int\n' +
                        '-firstDate:DD-MM-YYYY -lastDate:DD-MM-YYYY\n' +
                        '-all\n\n' +
                        'Control params format and last greater than first'
                )
            } else {
                if (time == 1) {
                    constraints.setFolderName(
                        params.firstDate + '-' + params.lastDate
                    )
                    constraints.setSaveFolder(
                        graphNoLayoutTime() + constraints.getFolderName() + '/'
                    )
                    logger.setPath(
                        logNoLayoutTime() + constraints.getFolderName() + '.log'
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
                            constraints.setRange(res)
                            downloadPhase(res)
                        })
                }
                if (block == 1) {
                    constraints.setFolderName(
                        params.firstBlock + '-' + params.lastBlock
                    )
                    constraints.setSaveFolder(
                        graphNoLayoutBlock() + constraints.getFolderName() + '/'
                    )
                    logger.setPath(
                        logNoLayoutBlock() +
                            constraints.getFolderName() +
                            '.log'
                    )
                    logger.log(
                        'Log of block type with firstBlock: ' +
                            params.firstBlock +
                            ' lastBlock: ' +
                            params.lastBlock
                    )
                    const range = {
                        first: parseInt(params.firstBlock),
                        last: parseInt(params.lastBlock)
                    }
                    constraints.setRange(range)
                    downloadPhase(range)
                }
                if (all == 1) {
                    constraints.setFolderName('all')
                    constraints.setSaveFolder(graphNoLayoutAll())
                    logger.setPath(
                        logNoLayoutAll() + constraints.getFolderName() + '.log'
                    )
                    logger.log('Log of all type')

                    retriever.allToBlocks().then(res => {
                        constraints.setRange(res)
                        const setRes = allSetup(res.last)
                        if (setRes.oldFound) {
                            split(() => {
                                downloadPhase(setRes.range)
                            })
                        } else {
                            downloadPhase(setRes.range)
                        }
                    })
                }
            }
        })
    } else {
        console.log('Wrong infuraApiKey, param -api=infuraApiKey')
    }
}

function allSetup(lastBlock) {
    var lastBlockDownloaded
    var found = false

    if (
        checkResourceExists(graphNoLayoutAll() + infoName()) &&
        checkResourceExists(graphNoLayoutAll() + jsonGraphName())
    ) {
        logger.log('Copying old "all" files for splitting')

        const info = JSON.parse(
            fs.readFileSync(graphNoLayoutAll() + infoName())
        )
        lastBlockDownloaded = parseInt(info.range.end)
        found = true

        fs.copyFileSync(
            graphNoLayoutAll() + jsonGraphName(),
            graphNoLayoutTemporary() + jsonGraphName()
        )
        saveInfo(graphNoLayoutTemporary() + infoName(), {
            saveFolder: constraints.getSaveFolder(),
            range: constraints.getRange(),
            missing: [
                {
                    start: lastBlockDownloaded + 1,
                    end: lastBlock
                }
            ]
        })
        logger.log('Copied old "all" files')
    } else {
        lastBlockDownloaded = -1
        logger.log('No previous download of "all", no file copied')
    }

    return {
        oldFound: found,
        range: {
            first: lastBlockDownloaded + 1,
            last: lastBlock
        }
    }
}

function downloadPhase(blocks) {
    logger.log('Start download phase')
    const workers = master(parseInt(blocks.first), parseInt(blocks.last))
    workers.startWorkers(api)
}

function checkDateFormat(date) {
    if (typeof date === 'string') {
        const parts = date.split('-').map(e => parseInt(e))
        if (parts[2] >= 0) {
            switch (parts[1]) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    if (parts[0] <= 31) {
                        return true
                    }
                    break
                case 2:
                    const bis = parts[2] % 4 == 0 ? 1 : 0
                    if (parts[0] <= 28 + bis) {
                        return true
                    }
                    break
                case 4:
                case 6:
                case 9:
                case 11:
                    if (parts[0] <= 30) {
                        return true
                    }
                    break
            }
        }
    }
    return false
}

main()

const fs = require('fs')
const argv = require('named-argv')

const constraints = require('./../utilities/constraints')
const logger = require('./../utilities/log')

const createEth = require('./../ethereum/eth')
const master = require('./../ethereum/downloader-master')
const retrieverSetKey = require('./../no-layout/block-retriever')
const { ensureDirExists } = require('./../utilities/utils')
const { dateComparator } = require('./../utilities/utils')
const { checkAll } = require('./checker')
const {
    logNoLayoutAll,
    logNoLayoutTime,
    logNoLayoutBlock,
    graphNoLayoutAll,
    graphNoLayoutTime,
    graphNoLayoutBlock
} = require('./../utilities/config')

const params = argv.opts

var time = 0
var block = 0
var all = 0

var eth
var api

function main() {
    if (params.api != undefined) {
        if (params.memory) {
            const defaultNodeMemory = 1400
            constraints.setMemory(defaultNodeMemory)
        }
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
                params.lastBlock >= params.firstBlock
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
                    ensureDirExists(graphNoLayoutTime())
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
                    ensureDirExists(logNoLayoutBlock())
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
                    ensureDirExists(graphNoLayoutAll())
                    constraints.setFolderName('all')
                    constraints.setSaveFolder(graphNoLayoutAll())
                    logger.setPath(
                        logNoLayoutAll() + constraints.getFolderName() + '.log'
                    )
                    logger.log('Log of all type')

                    //start test block
                    const res = { first: 1999998, last: 1999998 }
                    constraints.setRange(res)
                    const range = checkAll(res.last)
                    range.first = 1999998 //comment when second execute has last 1999999
                    downloadPhase(range)
                    //end test block

                    /*retriever.allToBlocks().then(res => {
                        constraints.setRange(res)
                        const range = checkAll(res.last)
                        downloadPhase(range)
                    })*/
                }
            }
        })
    } else {
        console.log('Wrong infuraApiKey, param -api=infuraApiKey')
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

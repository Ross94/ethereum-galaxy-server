const argv = require('named-argv')

const SpecSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const logger = require('./../utilities/log')

const createEth = require('./../ethereum/eth')
const master = require('./../ethereum/downloader-master')
const retrieverSetKey = require('./../no-layout/block-retriever')
const { ensureDirExists } = require('./../utilities/utils')
const { dateComparator } = require('./../utilities/utils')
const { checkAll } = require('./checker')
const LogConstants = require('./../utilities/constants/log-constants')
    .LogConstants
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants

main()
function main() {
    const params = argv.opts

    var time = 0
    var block = 0
    var all = 0

    var api

    if (params.help) {
        console.log(optionsOutput())
    } else if (params.resume) {
        console.log('TO-DO implement resume')
    } else if (params.api != undefined) {
        memoryConfig()

        api = params.api
        const retriever = retrieverSetKey(api)

        const eth = createEth(params.api)
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
                console.log(optionsOutput())
            } else {
                ensureDirExists(NoLayoutConstants.graphNoLayoutTemporary)
                if (time == 1) {
                    ensureDirExists(NoLayoutConstants.graphNoLayoutTime)
                    RunSettings.setFolderName(
                        params.firstDate + '-' + params.lastDate
                    )
                    RunSettings.setSaveFolderPath(
                        NoLayoutConstants.graphNoLayoutTime +
                            RunSettings.getFolderName() +
                            '/'
                    )
                    logger.setPath(
                        LogConstants.logNoLayoutTime +
                            RunSettings.getFolderName() +
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
                            RunSettings.setRange(res)
                            downloadPhase(res)
                        })
                }
                if (block == 1) {
                    ensureDirExists(NoLayoutConstants.graphNoLayoutBlock)
                    RunSettings.setFolderName(
                        params.firstBlock + '-' + params.lastBlock
                    )
                    RunSettings.setSaveFolderPath(
                        NoLayoutConstants.graphNoLayoutBlock +
                            RunSettings.getFolderName() +
                            '/'
                    )
                    logger.setPath(
                        LogConstants.logNoLayoutBlock +
                            RunSettings.getFolderName() +
                            '.log'
                    )
                    logger.log(
                        'Log of block type with firstBlock: ' +
                            params.firstBlock +
                            ' lastBlock: ' +
                            params.lastBlock
                    )
                    const range = {
                        start: parseInt(params.firstBlock),
                        end: parseInt(params.lastBlock)
                    }
                    RunSettings.setRange(range)
                    downloadPhase(range)
                }
                if (all == 1) {
                    ensureDirExists(NoLayoutConstants.graphNoLayoutAll)
                    RunSettings.setFolderName('all')
                    RunSettings.setSaveFolderPath(
                        NoLayoutConstants.graphNoLayoutAll
                    )
                    logger.setPath(
                        LogConstants.logNoLayoutAll +
                            RunSettings.getFolderName() +
                            '.log'
                    )
                    logger.log('Log of all type')

                    //start test block
                    const res = { start: 1999998, end: 1999998 }
                    RunSettings.setRange(res)
                    const range = checkAll(res.end)
                    range.start = 1999998 //comment when second execute has last 1999999
                    downloadPhase(range)
                    //end test block

                    /*
                    retriever.allToBlocks().then(res => {
                        RunSettings.setRange(res)
                        const range = checkAll(res.last)
                        downloadPhase(range)
                    })*/
                }
            }
        })
    } else {
        console.log(optionsOutput())
    }

    function optionsOutput() {
        return (
            'Choose one of these run options:\n' +
            '-help => show help list \n' +
            '-api:hex -firstBlock:int -lastBlock:int => download transactions in range of block number\n' +
            '-api:hex -firstDate:DD-MM-YYYY -lastDate:DD-MM-YYYY => download transactions in range of date\n' +
            '-api:hex -all => download all transactions in blockchain\n' +
            '-resume => resume not completed previous download\n\n' +
            'Optional flags: \n' +
            '-memory:int => set memory used by program, number of MB or empty to default node value (1400)\n\n' +
            'Note: Control params format and last greater than first\n'
        )
    }

    function memoryConfig() {
        SpecSettings.setGlobalMemory(
            Math.ceil(require('os').freemem() / 1000000)
        )
        if (params.memory) {
            const defaultNodeMemory = 1400
            SpecSettings.setGlobalMemory(defaultNodeMemory)
        }
        if (!isNaN(parseInt(params.memory))) {
            SpecSettings.setGlobalMemory(parseInt(params.memory))
        }
    }

    function downloadPhase(blocks) {
        logger.log('Start download phase')
        const workers = master(parseInt(blocks.start), parseInt(blocks.end))
        workers.startWorkers(api)
    }

    function checkDateFormat(date) {
        if (typeof date === 'string') {
            const parts = date.split('-').map(elem => parseInt(elem))
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
}

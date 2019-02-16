const fs = require('fs')
const argv = require('named-argv')

const createEth = require('./../ethereum/eth')
const master = require('./../ethereum/downloader-master')
const retrieverSetKey = require('./../no-layout/block-retriever')

const SpecsSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')
const MainShutdown = require('../shutdown/main-shutdown')

const LOG_CONSTANTS = require('./../utilities/constants/log-constants')
    .LOG_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const MAIN_PROCESS_PHASES = require('./../shutdown/phases').MAIN_PROCESS_PHASES

const logger = require('./../utilities/log')

const { checkResourceExists, ensureDirExists } = require('./../utilities/utils')
const { dateComparator } = require('./../utilities/utils')
const { checkAll } = require('./checker')
const { generate } = require('./../generation/generator-master')

MainShutdown.setShutdownBehaviour()
main()

function main() {
    const params = argv.opts

    var time = 0
    var block = 0
    var all = 0

    if (params.help) {
        console.log(optionsOutput())
    } else if (params.resume) {
        if (checkResourceExists(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())) {
            //import saved config
            const config = JSON.parse(
                fs.readFileSync(
                    NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                        GLOBAL_CONSTANTS.infoFilename()
                )
            )

            logger.setPath(config.logger_path)
            logger.log(
                'Resume started! previous download settings: ' +
                    config.requested_data
            )

            RunSettings.setSaveFolderPath(config.folder_path)
            RunSettings.setFolderName(config.folder_name)
            RunSettings.setRange(config.range)
            MainShutdown.changePhase(config.phase)
            RecoverySettings.setRequestedData(config.requested_data)
            memoryConfig()

            //resume
            switch (config.phase) {
                case MAIN_PROCESS_PHASES.DownloadPhase():
                    downloadPhase({
                        start: parseInt(config.missing.start),
                        end: parseInt(config.missing.end)
                    })
                    break
                case MAIN_PROCESS_PHASES.GenerationPhase():
                    generate(config.format)
                    break
            }
        } else {
            console.log('No previous download to resume!\n')
            console.log(optionsOutput())
        }
    } else if (params.api != undefined) {
        memoryConfig()

        const retriever = retrieverSetKey(params.api)

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
                //clean old download, if i don't want it if i want to resume, pass -resume param
                if (
                    checkResourceExists(
                        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath()
                    )
                ) {
                    fs
                        .readdirSync(
                            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath()
                        )
                        .forEach(file =>
                            fs.unlinkSync(
                                NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                                    file
                            )
                        )
                }
                ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())

                if (time == 1) {
                    ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutTimePath())
                    RecoverySettings.setRequestedData(
                        params.firstDate + ' ' + params.lastDate
                    )

                    RunSettings.setFolderName(
                        params.firstDate + '-' + params.lastDate
                    )
                    RunSettings.setSaveFolderPath(
                        NO_LAYOUT_CONSTANTS.noLayoutTimePath() +
                            RunSettings.getFolderName() +
                            '/'
                    )
                    logger.setPath(
                        LOG_CONSTANTS.noLayoutTimeLog() +
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
                    ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutBlockPath())
                    RecoverySettings.setRequestedData(
                        params.firstBlock + ' ' + params.lastBlock
                    )

                    RunSettings.setFolderName(
                        params.firstBlock + '-' + params.lastBlock
                    )
                    RunSettings.setSaveFolderPath(
                        NO_LAYOUT_CONSTANTS.noLayoutBlockPath() +
                            RunSettings.getFolderName() +
                            '/'
                    )
                    logger.setPath(
                        LOG_CONSTANTS.noLayoutBlockLog() +
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
                    ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutAllPath())
                    RecoverySettings.setRequestedData('all')

                    RunSettings.setFolderName('all')
                    RunSettings.setSaveFolderPath(
                        NO_LAYOUT_CONSTANTS.noLayoutAllPath()
                    )
                    logger.setPath(
                        LOG_CONSTANTS.noLayoutAllLog() +
                            RunSettings.getFolderName() +
                            '.log'
                    )
                    logger.log('Log of all type')

                    //start test block
                    const res = { start: 1999998, end: 2000000 }
                    //const res = { start: 2724709, end: 2730770 }
                    RunSettings.setRange(res)
                    const range = checkAll(res.end)
                    //range.start = 1999998 //comment when second execute has last 1999999
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
            '-api:hex -resume => resume not completed previous download\n\n' +
            'Optional flags: \n' +
            '-memory:int => set memory used by program, number of MB or empty to default node value (1400)\n\n' +
            'Note: Control params format and last greater than first\n'
        )
    }

    function memoryConfig() {
        SpecsSettings.setGlobalMemory(
            Math.ceil(require('os').freemem() / 1000000)
        )
        if (params.memory) {
            const defaultNodeMemory = 1400
            SpecsSettings.setGlobalMemory(defaultNodeMemory)
        }
        if (!isNaN(parseInt(params.memory))) {
            SpecsSettings.setGlobalMemory(parseInt(params.memory))
        }
    }

    function downloadPhase(blocks) {
        const workers = master(parseInt(blocks.start), parseInt(blocks.end))
        workers.startWorkers(params.api)
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

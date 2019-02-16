const fs = require('fs')

const RunSettings = require('../utilities/settings/run-settings')

const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const JSON_COSTANTS = require('./../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const PAJEK_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS

const logger = require('./../utilities/log')

const { checkResourceExists, ensureDirExists } = require('./../utilities/utils')

function checkAll(lastBlock) {
    var lastBlockDownloaded

    ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())
    if (
        checkResourceExists(
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                GLOBAL_CONSTANTS.infoFilename()
        ) &&
        checkResourceExists(
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                JSON_COSTANTS.jsonGraphFilename()
        ) &&
        checkResourceExists(
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                PAJEK_CONSTANTS.pajekGraphFilename()
        )
    ) {
        RunSettings.setOldDownload(true)
        logger.log(
            'Previous download of "all" find, download only missing data'
        )

        const info = JSON.parse(
            fs.readFileSync(
                NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                    GLOBAL_CONSTANTS.infoFilename()
            )
        )

        lastBlockDownloaded = parseInt(info.range.end)
    } else {
        lastBlockDownloaded = -1
        logger.log('No previous download of "all", split phase skipped')
    }

    return {
        start: lastBlockDownloaded + 1,
        end: lastBlock
    }
}

module.exports = {
    checkAll
}

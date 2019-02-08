const fs = require('fs')

const MainShutdown = require('./../shutdown/main-shutdown')
const RunSettings = require('../utilities/settings/run-settings')
const logger = require('./../utilities/log')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const JsonNameConstants = require('./../utilities/constants/files-name-constants')
    .JsonNameConstants
const PajekNameConstants = require('./../utilities/constants/files-name-constants')
    .PajekNameConstants
const { checkResourceExists, ensureDirExists } = require('./../utilities/utils')

function checkAll(lastBlock) {
    var lastBlockDownloaded

    ensureDirExists(NoLayoutConstants.noLayoutTemporaryPath())
    if (
        checkResourceExists(
            NoLayoutConstants.noLayoutAllPath() +
                GlobalNameConstants.infoFilename()
        ) &&
        checkResourceExists(
            NoLayoutConstants.noLayoutAllPath() +
                JsonNameConstants.jsonGraphFilename()
        ) &&
        checkResourceExists(
            NoLayoutConstants.noLayoutAllPath() +
                PajekNameConstants.pajekGraphFilename()
        )
    ) {
        RunSettings.setOldDownload(true)
        logger.log(
            'Previous download of "all" find, download only missing data'
        )

        const info = JSON.parse(
            fs.readFileSync(
                NoLayoutConstants.noLayoutAllPath() +
                    GlobalNameConstants.infoFilename()
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

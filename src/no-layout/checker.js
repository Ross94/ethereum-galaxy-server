const fs = require('fs')

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
const { saveInfo } = require('./../utilities/files')
const { checkResourceExists, ensureDirExists } = require('./../utilities/utils')

function checkAll(lastBlock) {
    var lastBlockDownloaded

    ensureDirExists(NoLayoutConstants.graphNoLayoutTemporary)
    if (
        checkResourceExists(
            NoLayoutConstants.graphNoLayoutAll + GlobalNameConstants.infoName
        ) &&
        checkResourceExists(
            NoLayoutConstants.graphNoLayoutAll + JsonNameConstants.jsonGraphName
        ) &&
        checkResourceExists(
            NoLayoutConstants.graphNoLayoutAll +
                PajekNameConstants.pajekGraphName
        )
    ) {
        RunSettings.setOldDownload(true)
        logger.log(
            'Previous download of "all" find, download only missing data'
        )

        const info = JSON.parse(
            fs.readFileSync(
                NoLayoutConstants.graphNoLayoutAll +
                    GlobalNameConstants.infoName
            )
        )

        lastBlockDownloaded = parseInt(info.range.end)
        //info
        saveInfo(
            NoLayoutConstants.graphNoLayoutTemporary +
                GlobalNameConstants.infoName,
            {
                saveFolder: RunSettings.getSaveFolderPath(),
                range: RunSettings.getRange(),
                missing: [
                    {
                        start: lastBlockDownloaded + 1,
                        end: lastBlock
                    }
                ]
            }
        )
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

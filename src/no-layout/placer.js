const fs = require('fs')
const execSync = require('child_process').execSync

const logger = require('./../utilities/log')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const JsonNameConstants = require('./../utilities/constants/files-name-constants')
    .JsonNameConstants
const PajekNameConstants = require('./../utilities/constants/files-name-constants')
    .PajekNameConstants
const RunSettings = require('./../utilities/settings/run-settings')
const { ensureDirExists } = require('./../utilities/utils')
const { saveInfo } = require('./../utilities/files')

function move() {
    logger.log('Start moving files to correct directory')

    ensureDirExists(RunSettings.getSaveFolderPath())
    logger.log('Destination directory: ' + RunSettings.getSaveFolderPath())

    //move json
    fs.renameSync(
        NoLayoutConstants.noLayoutTemporaryPath() +
            JsonNameConstants.jsonGraphFilename(),
        RunSettings.getSaveFolderPath() + JsonNameConstants.jsonGraphFilename()
    )
    logger.log('Moved ' + JsonNameConstants.jsonGraphFilename())

    //move pajek
    fs.renameSync(
        NoLayoutConstants.noLayoutTemporaryPath() +
            PajekNameConstants.pajekGraphFilename(),
        RunSettings.getSaveFolderPath() +
            PajekNameConstants.pajekGraphFilename()
    )
    logger.log('Moved ' + PajekNameConstants.pajekGraphFilename())

    //generate info
    const elemsData = countElems()
    saveInfo(
        RunSettings.getSaveFolderPath() + GlobalNameConstants.infoFilename(),
        {
            range: RunSettings.getRange(),
            nodes_number: elemsData.nodesNumber,
            links_number: elemsData.linksNumber
        }
    )
    logger.log('Generated ' + GlobalNameConstants.infoFilename())

    //delete temp files
    fs
        .readdirSync(NoLayoutConstants.noLayoutTemporaryPath())
        .forEach(file =>
            fs.unlinkSync(NoLayoutConstants.noLayoutTemporaryPath() + file)
        )
    fs.rmdirSync(NoLayoutConstants.noLayoutTemporaryPath())
    fs.unlinkSync(GlobalNameConstants.runningFilename())
    logger.log('Delete temp files')
    logger.log('End moving files')

    function countElems() {
        const filePath =
            RunSettings.getSaveFolderPath() +
            PajekNameConstants.pajekGraphFilename()
        const linesNumber = parseInt(execSync('wc -l < ' + filePath).toString())
        const pajekLines = 2

        const nodesNumber = parseInt(
            execSync('head -1 ' + filePath)
                .toString()
                .split(' ')[1]
        )
        const linksNumber = linesNumber - nodesNumber - pajekLines

        return {
            nodesNumber: nodesNumber,
            linksNumber: linksNumber
        }
    }
}

module.exports = {
    move
}

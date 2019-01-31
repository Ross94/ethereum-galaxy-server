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
const { ensureDirExists } = require('./../utilities/utils')
const { saveInfo } = require('./../utilities/files')

function move() {
    logger.log('Start moving files to correct directory')
    const info = JSON.parse(
        fs.readFileSync(
            NoLayoutConstants.noLayoutTemporaryPath() +
                GlobalNameConstants.infoFilename()
        )
    )
    ensureDirExists(info.saveFolder)
    logger.log('Destination directory: ' + info.saveFolder)

    //move json
    fs.renameSync(
        NoLayoutConstants.noLayoutTemporaryPath() +
            JsonNameConstants.jsonGraphFilename(),
        info.saveFolder + JsonNameConstants.jsonGraphFilename()
    )
    logger.log('Moved ' + JsonNameConstants.jsonGraphFilename())

    //move pajek
    fs.renameSync(
        NoLayoutConstants.noLayoutTemporaryPath() +
            PajekNameConstants.pajekGraphFilename(),
        info.saveFolder + PajekNameConstants.pajekGraphFilename()
    )
    logger.log('Moved ' + PajekNameConstants.pajekGraphFilename())

    //generate info
    const elemsData = countElems()
    saveInfo(info.saveFolder + GlobalNameConstants.infoFilename(), {
        range: info.range,
        nodes_number: elemsData.nodesNumber,
        links_number: elemsData.linksNumber
    })
    logger.log('Moved ' + GlobalNameConstants.infoFilename())

    //delete temp files
    fs
        .readdirSync(NoLayoutConstants.noLayoutTemporaryPath())
        .forEach(file =>
            fs.unlinkSync(NoLayoutConstants.noLayoutTemporaryPath() + file)
        )
    fs.rmdirSync(NoLayoutConstants.noLayoutTemporaryPath())
    logger.log('Delete temp files')
    logger.log('End moving files')

    function countElems() {
        const filePath =
            info.saveFolder + PajekNameConstants.pajekGraphFilename()
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

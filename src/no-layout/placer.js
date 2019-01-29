const fs = require('fs')
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

function move() {
    logger.log('Start moving files to correct directory')
    const info = JSON.parse(
        fs.readFileSync(
            NoLayoutConstants.graphNoLayoutTemporary +
                GlobalNameConstants.infoName
        )
    )
    ensureDirExists(info.saveFolder)
    logger.log('Destination directory: ' + info.saveFolder)
    //json
    fs.renameSync(
        NoLayoutConstants.graphNoLayoutTemporary +
            JsonNameConstants.jsonGraphName,
        info.saveFolder + JsonNameConstants.jsonGraphName
    )
    logger.log('Moved ' + JsonNameConstants.jsonGraphName)
    //pajek
    fs.renameSync(
        NoLayoutConstants.graphNoLayoutTemporary +
            PajekNameConstants.pajekGraphName,
        info.saveFolder + PajekNameConstants.pajekGraphName
    )
    logger.log('Moved ' + PajekNameConstants.pajekGraphName)
    //info
    fs.renameSync(
        NoLayoutConstants.graphNoLayoutTemporary + GlobalNameConstants.infoName,
        info.saveFolder + GlobalNameConstants.infoName
    )
    logger.log('Moved ' + GlobalNameConstants.infoName)
    fs
        .readdirSync(NoLayoutConstants.graphNoLayoutTemporary)
        .forEach(file =>
            fs.unlinkSync(NoLayoutConstants.graphNoLayoutTemporary + file)
        )
    fs.rmdirSync(NoLayoutConstants.graphNoLayoutTemporary)
    logger.log('Delete temp files')
    logger.log('End moving files')
}

module.exports = {
    move
}

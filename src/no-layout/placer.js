const fs = require('fs')
const logger = require('./../utilities/log')
const { ensureDirExists } = require('./../utilities/utils')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    infoName,
    pajekGraphName
} = require('./../utilities/config')

function move() {
    logger.log('Start moving files to correct directory')
    const info = JSON.parse(
        fs.readFileSync(graphNoLayoutTemporary() + infoName())
    )
    ensureDirExists(info.saveFolder)
    logger.log('Destination directory: ' + info.saveFolder)
    //json
    fs.renameSync(
        graphNoLayoutTemporary() + jsonGraphName(),
        info.saveFolder + jsonGraphName()
    )
    logger.log('Moved ' + jsonGraphName())
    //pajek
    fs.renameSync(
        graphNoLayoutTemporary() + pajekGraphName(),
        info.saveFolder + pajekGraphName()
    )
    logger.log('Moved ' + pajekGraphName())
    //info
    fs.renameSync(
        graphNoLayoutTemporary() + infoName(),
        info.saveFolder + infoName()
    )
    logger.log('Moved ' + infoName())
    fs
        .readdirSync(graphNoLayoutTemporary())
        .forEach(file => fs.unlinkSync(graphNoLayoutTemporary() + file))
    fs.rmdirSync(graphNoLayoutTemporary())
    logger.log('Delete temp files')
    logger.log('End moving files')
}

module.exports = {
    move
}

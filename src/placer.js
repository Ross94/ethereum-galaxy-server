const fs = require('fs')
const logger = require('./log')
const constraints = require('./constraints')
const { ensureDirExists } = require('./utils')
const {
    graphNoLayoutTemporary,
    jsonGraphName,
    infoName,
    pajekGraphName
} = require('./config')

function move() {
    logger.log('Start moving files to correct directory')
    const info = JSON.parse(
        fs.readFileSync(graphNoLayoutTemporary() + infoName())
    )
    ensureDirExists(info.saveFolder)
    logger.log('Destination directory: ' + info.saveFolder)
    fs.renameSync(
        graphNoLayoutTemporary() + jsonGraphName(),
        info.saveFolder + jsonGraphName()
    )
    logger.log('Moved ' + jsonGraphName())
    //fs.renameSync(graphNoLayoutTemporary()+pajekGraphName(), info.saveFolder+pajekGraphName())
    //logger.log("Moved " + pajekGraphName())
    fs.renameSync(
        graphNoLayoutTemporary() + infoName(),
        info.saveFolder + infoName()
    )
    logger.log('Moved ' + infoName())
    fs
        .readdirSync(graphNoLayoutTemporary())
        .forEach(file => fs.unlinkSync(graphNoLayoutTemporary() + file))
    logger.log('Delete temp files')
    logger.log('End moving files')
}

module.exports = {
    move
}

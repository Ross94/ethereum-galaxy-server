const fs = require('fs')

const constraints = require('./../utilities/constraints')
const logger = require('./../utilities/log')
const { saveInfo } = require('./../utilities/files')
const { checkResourceExists, ensureDirExists } = require('./../utilities/utils')
const {
    graphNoLayoutAll,
    graphNoLayoutTemporary,
    infoName,
    jsonGraphName,
    pajekGraphName
} = require('./../utilities/config')

function checkAll(lastBlock) {
    var lastBlockDownloaded

    ensureDirExists(graphNoLayoutTemporary())
    if (
        checkResourceExists(graphNoLayoutAll() + infoName()) &&
        checkResourceExists(graphNoLayoutAll() + jsonGraphName()) &&
        checkResourceExists(graphNoLayoutAll() + pajekGraphName())
    ) {
        constraints.setOldDownload(true)
        logger.log('Copying old "all" files for splitting')

        const info = JSON.parse(
            fs.readFileSync(graphNoLayoutAll() + infoName())
        )

        lastBlockDownloaded = parseInt(info.range.last)
        //json
        fs.copyFileSync(
            graphNoLayoutAll() + jsonGraphName(),
            graphNoLayoutTemporary() + jsonGraphName()
        )
        //pajek
        fs.copyFileSync(
            graphNoLayoutAll() + pajekGraphName(),
            graphNoLayoutTemporary() + pajekGraphName()
        )
        //info
        saveInfo(graphNoLayoutTemporary() + infoName(), {
            saveFolder: constraints.getSaveFolder(),
            range: constraints.getRange(),
            missing: [
                {
                    start: lastBlockDownloaded + 1,
                    end: lastBlock
                }
            ]
        })

        logger.log('Copied old "all" files')
    } else {
        lastBlockDownloaded = -1
        logger.log('No previous download of "all", no file copied')
    }

    return {
        first: lastBlockDownloaded + 1,
        last: lastBlock
    }
}

module.exports = {
    checkAll
}

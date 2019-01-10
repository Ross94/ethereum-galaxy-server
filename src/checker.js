const fs = require('fs')
const constraints = require('./constraints')
const { graphNoLayoutTemporary } = require('./config')
const logger = require('./log')

function oldDownloadEnded(info) {
    if (info.missing.length == 0) {
        logger.log('Old download is ended')
        //move it
    } else {
        logger.log('Old download is not ended, resume...')
        //resume download
    }
}

function checkOldDownload() {
    /*const path = graphNoLayoutTemporary() + "info.json"
	if(fs.existsSync(path)) {
		logger.log("Old download is present")
		const info = JSON.parse(fs.readFileSync(path))
		oldDownloadEnded(info)
	} else {
		logger.log("No old download")
	}*/
}

module.exports = {
    checkOldDownload
}

const fs = require('fs')
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {})
    },
    isRunning: () => {
        return JSON.parse(
            fs.readFileSync(GlobalNameConstants.runningFilename())
        ).running
    },
    terminate: () => {
        process.disconnect()
        process.exit(0)
    }
}

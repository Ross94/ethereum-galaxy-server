const fs = require('fs')
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants

var currentPhase = undefined

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {})
    },
    isRunning: () => {
        /*
        if json is correct read the vaue, if is incorrect, main process write file while
        children read, then state was change to false, and i return false in catch.
        */
        try {
            const jsonData = JSON.parse(
                fs.readFileSync(GlobalNameConstants.runningFilename())
            )
            return jsonData.running
        } catch (err) {
            return false
        }
    },
    changePhase: phase => {
        currentPhase = phase
    },
    getCurrentPhase: () => {
        return currentPhase
    },
    terminate: () => {
        process.disconnect()
        process.exit(0)
    }
}

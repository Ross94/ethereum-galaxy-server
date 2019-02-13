const fs = require('fs')

const logger = require('../utilities/log')
const MainProcessPhases = require('./phases').MainProcessPhases
const RunSettings = require('../utilities/settings/run-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const { saveInfo } = require('./../utilities/files')
const { ensureDirExists } = require('./../utilities/utils')

var currentPhase = MainProcessPhases.ParsePhase()

const info = {
    logger_path: logger.getPath(),
    requested_data: RecoverySettings.getRequestedData(),
    folder_path: RunSettings.getSaveFolderPath(),
    folder_name: RunSettings.getFolderName(),
    range: RunSettings.getRange(),
    missing: {},
    phase: currentPhase,
    format: []
}

module.exports = {
    setShutdownBehaviour: () => {
        ensureDirExists(NoLayoutConstants.noLayoutPath())
        fs.writeFileSync(
            GlobalNameConstants.runningFilename(),
            JSON.stringify({ running: true })
        )

        process.on('SIGINT', () => {
            if (currentPhase === MainProcessPhases.ParsePhase()) {
                process.exit(0)
            }

            logger.log(
                'Start shutdown... next time you can resume this run whit -resume param or start new one'
            )
            fs.writeFileSync(
                GlobalNameConstants.runningFilename(),
                JSON.stringify({ running: false })
            )
        })
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
    save: changes => {
        //refresh fields
        ;(info.logger_path = logger.getPath()),
            (info.requested_data = RecoverySettings.getRequestedData())
        info.folder_path = RunSettings.getSaveFolderPath()
        info.folder_name = RunSettings.getFolderName()
        info.range = RunSettings.getRange()
        info.phase = currentPhase

        //add format fields
        Object.keys(changes).forEach(key => {
            var find = false
            if (key === 'format') {
                info.format.forEach(f => {
                    if (f.format_name === changes.format.format_name) {
                        find = true
                        format.current_phase = changes.format.current_phase
                    }
                })
                if (!find) {
                    info.format.push(changes.format)
                }
            } else {
                info[key] = changes[key]
            }
        })

        //save
        saveInfo(
            NoLayoutConstants.noLayoutTemporaryPath() +
                GlobalNameConstants.infoFilename(),
            info
        )
    },
    terminate: () => {
        fs.unlinkSync(GlobalNameConstants.runningFilename())
        logger.log('Shutdown completed', () => process.exit(0))
    }
}

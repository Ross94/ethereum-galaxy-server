const logger = require('../utilities/log')
const MainProcessPhases = require('./phases').MainProcessPhases
const RunSettings = require('../utilities/settings/run-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const { saveInfo } = require('./../utilities/files')

var running = true
var currentPhase = MainProcessPhases.ParsePhase()

function infoData() {
    return {
        logger_path: logger.getPath(),
        requested_data: RecoverySettings.getRequestedData(),
        folder_path: RunSettings.getSaveFolderPath(),
        folder_name: RunSettings.getFolderName(),
        range: RunSettings.getRange(),
        missing: {},
        phase: currentPhase,
        format: []
    }
}

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {
            if (currentPhase === MainProcessPhases.ParsePhase()) {
                process.exit(0)
            }
            logger.log(
                'Start shutdown... next time you can resume this run whit -resume param or start new one'
            )
            running = false
        })
    },
    isRunning: () => {
        return running
    },
    changePhase: phase => {
        currentPhase = phase
    },
    getCurrentPhase: () => {
        return currentPhase
    },
    save: changes => {
        const info = infoData()
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
        saveInfo(
            NoLayoutConstants.noLayoutTemporaryPath() +
                GlobalNameConstants.infoFilename(),
            info
        )
    },
    terminate: () => {
        logger.log('Shutdown completed', () => process.exit(0))
    }
}

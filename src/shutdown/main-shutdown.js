const logger = require('../utilities/log')
const MainProcessPhases = require('./phases').MainProcessPhases
const RunSettings = require('../utilities/settings/run-settings')
const SpecSettings = require('../utilities/settings/spec-settings')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const { saveInfo } = require('./../utilities/files')

var running = true
var currentPhase = MainProcessPhases.ParsePhase()

const infoData = {
    saveFolder: RunSettings.getSaveFolderPath(),
    range: RunSettings.getRange(),
    missing: [],
    specs: {
        global_memory: SpecSettings.getGlobalMemory()
    },
    phase: currentPhase,
    format: []
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
        Object.keys(changes).forEach(key => {
            var find = false
            if (key === 'format') {
                infoData.format.forEach(f => {
                    if (f.format_name === changes.format.format_name) {
                        find = true
                        format.current_phase = changes.format.current_phase
                    }
                })
                if (!find) {
                    infoData.format.push(changes.format)
                }
            } else {
                infoData[key] = changes[key]
            }
        })
        saveInfo(
            NoLayoutConstants.noLayoutTemporaryPath() +
                GlobalNameConstants.infoFilename(),
            infoData
        )
    },
    terminate: () => {
        logger.log('Shutdown completed', () => process.exit(0))
    }
}

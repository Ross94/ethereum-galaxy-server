const logger = require('../utilities/log')
const Phases = require('./phases').Phases

var running = true
var currentPhase = Phases.ParsePhase()

const ShutdownManager = (module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {
            if (currentPhase === Phases.ParsePhase()) {
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
    terminate: () => {
        logger.log('Shutdown completed', () => process.exit(0))
    }
})

var running = true
var currentPhase = undefined

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {
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
        process.exit(0)
    }
}

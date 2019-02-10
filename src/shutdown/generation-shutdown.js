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
        //TO-DO call process.disconnect() ?
        process.exit(0)
    }
}

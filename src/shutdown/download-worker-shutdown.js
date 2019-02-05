var running = true

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {
            running = false
        })
    },
    isRunning: () => {
        return running
    },
    terminate: () => {
        process.disconnect()
        process.exit(0)
    }
}

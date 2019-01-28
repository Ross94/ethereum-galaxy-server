const child_process = require('child_process')
const constraints = require('./../utilities/constraints')
const logger = require('./../utilities/log')
const { move } = require('./../no-layout/placer')

function generate() {
    const workers = new Map()
    var children = 0
    var childrenTerminated = 0

    const format = [
        './build/generation/json/json-generator',
        './build/generation/pajek/pajek-generator'
    ]
    format.forEach(childPath => startWorker(childPath, format.length))

    function response(pid, message) {
        workers.get(pid).send(message)
    }

    function startWorker(modulePath, processNum) {
        children += 1

        const child = child_process.fork(modulePath)

        workers.set(child.pid, child)

        child.on('message', function(message) {
            switch (message.command) {
                case 'end':
                    response(message.pid, { command: 'end' })
                    childrenTerminated += 1
                    if (childrenTerminated == children) {
                        terminated()
                    }
                    break
                default:
                    logger.error(
                        '[child ' +
                            message.child +
                            '] send wrong command + ' +
                            message.command
                    )
            }
        })

        child.send({
            command: 'start',
            loggerPath: logger.getPath(),
            saveFolder: constraints.getSaveFolder(),
            folderName: constraints.getFolderName(),
            range: constraints.getRange(),
            processNum: processNum,
            memory: constraints.getMemory(),
            oldDownload: constraints.getOldDownload()
        })
    }

    function terminated() {
        move()
    }
}

module.exports = {
    generate
}

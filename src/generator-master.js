const child_process = require('child_process')
const constraints = require('./constraints')
const logger = require('./log')
const { move } = require('./placer')

const workers = new Map()
var children = 0
var childrenTerminated = 0

function response(pid, message) {
    workers.get(pid).send(message)
}

function startWorker(modulePath) {
    children += 1

    const child = child_process.fork(modulePath, {
        execArgv: ['--max-old-space-size=' + constraints.getMemory()]
    })

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
        memory: constraints.getMemory(),
        range: constraints.getRange()
    })
}

function terminated() {
    move()
}

function generate() {
    startWorker('./build/json-generator')
}

module.exports = {
    generate
}

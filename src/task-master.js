const child_process = require('child_process')
const { temporaryFilePath } = require('./config')
const { deleteFolder, ensureDirExists } = require('./utils')
const { saveInfo } = require('./files')
const logger = require('./log')
const constraints = require('./constraints')

const CPUs = require('os').cpus().length
const chunkSize = 240

const progressBarMsg = `Retrieving chunk (each one has size of ${chunkSize})...`
var chunkNumber

module.exports = (start, end) => {
    const workers = new Map()

    var task = {
        start: start,
        end: end
    }

    chunkNumber = Math.ceil((task.end - task.start) / chunkSize)

    var lastSaved = -1

    const progressBar = logger.progress(progressBarMsg, chunkNumber)

    ensureDirExists(constraints.getSaveFolder() + 'temporary/')

    function availableTask() {
        function getTask() {
            const ret = Array(
                task.end - task.start >= chunkSize
                    ? chunkSize
                    : task.end - task.start
            )
                .fill(1)
                .map((one, index) => task.start + one + (index - 1))
            task.start += chunkSize
            return ret
        }

        if (task.start < task.end) {
            return getTask()
        }
        return false
    }

    function response(pid, message) {
        workers.get(pid).send(message)
    }

    function startWorkers(infuraApiKey) {
        for (var i = 0; i < CPUs; i++) {
            var child = child_process.fork('./build/task-worker')
            workers.set(child.pid, child)
            child.send({
                command: 'config',
                filename:
                    constraints.getSaveFolder() + 'temporary/' + i + '.json',
                api: infuraApiKey
            })
            child.on('message', function(message) {
                switch (message.command) {
                    case 'new task':
                        if (message.lastBlock > lastSaved) {
                            lastSaved = message.lastBlock
                            saveInfo(
                                constraints.getSaveFolder() + 'info.json',
                                {
                                    start: start,
                                    end: lastSaved
                                }
                            )
                        }
                        const res = availableTask()
                        if (!res) {
                            response(message.pid, { command: 'end' })
                        } else {
                            progressBar.tick()
                            logger.log(
                                progressBarMsg +
                                    ' ' +
                                    progressBar.curr +
                                    '/' +
                                    chunkNumber
                            )
                            response(message.pid, {
                                command: 'task',
                                task: res
                            })
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
        }
    }

    return {
        startWorkers
    }
}

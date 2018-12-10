const child_process = require('child_process')
const { temporaryFilePath } = require('./config')
const { deleteFolder, ensureDirExists } = require('./utils')
const { saveInfo } = require('./files')
const logger = require('./log')

const CPUs = require('os').cpus().length
const chunkSize = 240

module.exports = (start, end) => {
    const workers = new Map()

    var task = {
        start: start,
        end: end
    }

    var lastSaved = -1

    const progressBar = logger.progress(
        `Retrieving chunk (each one has size of ${chunkSize})...`,
        Math.ceil((task.end - task.start) / chunkSize)
    )

    deleteFolder(temporaryFilePath())
    ensureDirExists(temporaryFilePath())

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
                filename: i + '.json',
                api: infuraApiKey
            })
            child.on('message', function(message) {
                switch (message.command) {
                    case 'new task':
                        console.log(message.lastBlock)
                        if (message.lastBlock > lastSaved) {
                            lastSaved = message.lastBlock
                            saveInfo(temporaryFilePath() + '/info.json', {
                                start: start,
                                end: lastSaved
                            })
                        }
                        const res = availableTask()
                        if (!res) {
                            response(message.pid, { command: 'end' })
                        } else {
                            progressBar.tick()
                            response(message.pid, {
                                command: 'task',
                                task: res
                            })
                        }
                        break
                    default:
                        console.log(
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

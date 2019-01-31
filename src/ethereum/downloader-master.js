const child_process = require('child_process')
const RunSettings = require('../utilities/settings/run-settings')
const SpecSettings = require('../utilities/settings/spec-settings')
const logger = require('./../utilities/log')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const GlobalNameConstants = require('./../utilities/constants/files-name-constants')
    .GlobalNameConstants
const { saveInfo } = require('./../utilities/files')

const { generate } = require('./../generation/generator-master')

const CPUs = require('os').cpus().length

const chunkSize = 240

const progressBarMsg = `Retrieving chunk (each one has size of ${chunkSize})...`

module.exports = (start, end) => {
    const workers = new Map()
    const firstBlock = start
    const lastBlock = end

    var nextBlock = start

    var task = [
        {
            start: firstBlock,
            end: lastBlock
        }
    ]

    const chunkNumber = Math.ceil((lastBlock - firstBlock + 1) / chunkSize)
    const progressBar = logger.progress(progressBarMsg, chunkNumber)

    function availableTask() {
        function getTask() {
            const ret = Array(
                lastBlock - nextBlock >= chunkSize
                    ? chunkSize
                    : lastBlock - nextBlock + 1
            )
                .fill(1)
                .map((one, index) => nextBlock + one + (index - 1))
            nextBlock += chunkSize
            return ret
        }

        if (nextBlock <= lastBlock) {
            return getTask()
        }
        return false
    }

    function response(pid, message) {
        workers.get(pid).send(message)
    }

    function save(miss) {
        saveInfo(
            NoLayoutConstants.graphNoLayoutTemporary +
                GlobalNameConstants.infoName,
            {
                saveFolder: RunSettings.getSaveFolderPath(),
                range: RunSettings.getRange(),
                missing: miss,
                specs: {
                    memory: SpecSettings.getGlobalMemory()
                }
            }
        )
    }

    function startWorkers(infuraApiKey) {
        var endedChild = 0
        save([
            {
                start: firstBlock,
                end: lastBlock
            }
        ])

        for (var i = 0; i < CPUs; i++) {
            var child = child_process.fork('./build/ethereum/downloader-worker')
            workers.set(child.pid, child)
            child.send({
                command: 'config',
                filename:
                    NoLayoutConstants.graphNoLayoutTemporary + i + '.json',
                api: infuraApiKey
            })
            child.on('message', function(message) {
                switch (message.command) {
                    case 'new task':
                        if (message.data != undefined) {
                            message.data.forEach(elem => {
                                addElem(elem)
                            })
                            save(task)
                            progressBar.tick()
                            logger.onlyLogFile(
                                progressBarMsg +
                                    ' ' +
                                    progressBar.curr +
                                    '/' +
                                    chunkNumber
                            )
                        }
                        const res = availableTask()
                        if (!res) {
                            response(message.pid, { command: 'end' })
                            endedChild++
                            if (endedChild == CPUs) {
                                generate()
                            }
                        } else {
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

    function addElem(elem) {
        var find = false
        var ind = 0
        const block = parseInt(elem)
        while (!find && ind < task.length) {
            const currentRange = task[ind]
            if (inside(block, currentRange)) {
                if (single(block, currentRange)) {
                    task.splice(task.indexOf(currentRange), 1)
                } else if (bottom(block, currentRange)) {
                    currentRange.start = block + 1
                } else if (top(block, currentRange)) {
                    currentRange.end = block - 1
                } else {
                    const start = currentRange.start
                    const end = currentRange.end
                    task.splice(task.indexOf(currentRange), 1)
                    task.push({ start: start, end: block - 1 })
                    task.push({ start: block + 1, end: end })
                }
                find = true
            }
            ind++
        }
    }

    function inside(e, range) {
        if (e >= range.start && e <= range.end) {
            return true
        }
        return false
    }

    function single(e, range) {
        if (e == range.start && e == range.end) {
            return true
        }
        return false
    }

    function top(e, range) {
        if (e == range.end) {
            return true
        }
        return false
    }

    function bottom(e, range) {
        if (e == range.start) {
            return true
        }
        return false
    }

    return {
        startWorkers
    }
}

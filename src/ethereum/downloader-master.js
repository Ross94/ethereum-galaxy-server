const child_process = require('child_process')

const logger = require('./../utilities/log')
const NoLayoutConstants = require('./../utilities/constants/no-layout-constants')
    .NoLayoutConstants
const MainProcessPhases = require('./../shutdown/phases').MainProcessPhases
const GlobalProcessCommand = require('./../utilities/process')
    .GlobalProcessCommand
const DownloadProcessCommand = require('./../utilities/process')
    .DownloadProcessCommand
const MainShutdown = require('./../shutdown/main-shutdown')
const { generate } = require('./../generation/generator-master')
const { sendMessage } = require('./../utilities/process')

const CPUs = 1 //require('os').cpus().length
const chunkSize = 1 //240
const progressBarMsg = `Retrieving chunk (each one has size of ${chunkSize})...`

module.exports = (start, end) => {
    logger.log('Start download phase')
    MainShutdown.changePhase(MainProcessPhases.DownloadPhase())

    const workers = new Map()
    const firstBlock = start
    const lastBlock = end

    var nextBlock = start
    var shutdownCalled = false
    //only for graphic reason, can use progressBar.curr, but log would be wrong
    var lastChunk = 0

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
        if (nextBlock <= lastBlock && MainShutdown.isRunning()) {
            return getTask()
        }
        return false
    }

    function startWorkers(infuraApiKey) {
        var endedChild = 0

        for (var i = 0; i < CPUs; i++) {
            const child = child_process.fork(
                './build/ethereum/downloader-worker'
            )
            workers.set(child.pid, child)
            sendMessage(
                DownloadProcessCommand.configCommand(),
                {
                    filename:
                        NoLayoutConstants.noLayoutTemporaryPath() + i + '.json',
                    api: infuraApiKey
                },
                child
            )
            child.on('message', function(message) {
                switch (message.command) {
                    case DownloadProcessCommand.newTaskCommand():
                        if (message.data != undefined) {
                            message.data.forEach(elem => {
                                addElem(elem)
                            })
                            lastChunk += 1
                            const progressBarTextualForm =
                                progressBarMsg +
                                ' ' +
                                lastChunk +
                                '/' +
                                chunkNumber
                            if (MainShutdown.isRunning()) {
                                progressBar.tick()
                                logger.onlyLogFile(progressBarTextualForm)
                            } else {
                                logger.log(progressBarTextualForm)
                            }
                        }
                        const res = availableTask()
                        if (!res) {
                            sendMessage(
                                GlobalProcessCommand.endCommand(),
                                undefined,
                                workers.get(message.pid)
                            )
                            endedChild++
                            if (endedChild == CPUs) {
                                if (
                                    shutdownCalled ||
                                    !MainShutdown.isRunning()
                                ) {
                                    MainShutdown.save({ missing: task })
                                    MainShutdown.terminate()
                                } else {
                                    MainShutdown.save({ missing: task })
                                    generate()
                                }
                            }
                        } else {
                            sendMessage(
                                DownloadProcessCommand.newTaskCommand(),
                                { task: res },
                                workers.get(message.pid)
                            )
                        }
                        break
                    case GlobalProcessCommand.stoppedCommand():
                        shutdownCalled = true
                        endedChild++
                        if (endedChild == CPUs) {
                            MainShutdown.terminate()
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

    /*
    Transaxtions to download are rappresented as range of block indexes for better memory usage.
    Due to more process is possible are missing blocks between other dowloaded
    (ex. 1-2-4-5 downloaded, 3 is missing).
    So are saved an array of range, when a block has been downloaded go in the array and remove a range,
    if is only for the block, increase lower bound or decrease upper bound if is presente on bound
    or split one range in two in other case.
    */
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

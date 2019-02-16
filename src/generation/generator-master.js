const child_process = require('child_process')

const SpecSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const MainShutdown = require('./../shutdown/main-shutdown')

const MAIN_PROCESS_PHASES = require('./../shutdown/phases').MAIN_PROCESS_PHASES
const GENERATION_PROCESS_PHASES = require('./../shutdown/phases')
    .GENERATION_PROCESS_PHASES
const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const FORMAT_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .FORMAT_CONSTANTS

const logger = require('./../utilities/log')

const { move } = require('./../no-layout/placer')
const { sendMessage } = require('./../utilities/process')

function generate(resumeData) {
    MainShutdown.changePhase(MAIN_PROCESS_PHASES.GenerationPhase())

    const workers = new Map()
    var children = 0
    var childrenTerminated = 0
    var shutdownCalled = false

    const format = []
    format.push(
        processObject(
            './build/generation/json/json-generator',
            FORMAT_CONSTANTS.jsonFormat()
        ),
        processObject(
            './build/generation/pajek/pajek-generator',
            FORMAT_CONSTANTS.pajekFormat()
        )
    )
    /*
    const format = [
        './build/generation/json/json-generator'
    ]*/

    SpecSettings.setProcessMemory(
        Math.ceil(SpecSettings.getGlobalMemory() / format.length)
    )

    //filter and start children not terminated
    if (resumeData != undefined) {
        resumeData.forEach(res => {
            const f = format.filter(
                f =>
                    f.format === res.format_name &&
                    res.phase !== GENERATION_PROCESS_PHASES.TerminatedPhase()
            )[0]
            if (f != undefined) {
                startWorker(f)
            }
        })
    } else {
        format.forEach(elem => startWorker(elem))
    }

    function processObject(modulePath, formatName) {
        return {
            path: modulePath,
            format: formatName
        }
    }

    function startWorker(formatElem) {
        children += 1

        const child = child_process.fork(formatElem.path)

        workers.set(child.pid, child)

        child.on('message', function(message) {
            switch (message.command) {
                case GLOBAL_PROCESS_COMMAND.endCommand():
                    sendMessage(
                        GLOBAL_PROCESS_COMMAND.endCommand(),
                        undefined,
                        workers.get(message.pid)
                    )
                    childrenTerminated += 1
                    MainShutdown.save(message.data)
                    if (childrenTerminated == children) {
                        if (shutdownCalled || !MainShutdown.isRunning()) {
                            MainShutdown.terminate()
                        } else {
                            move()
                        }
                    }
                    break
                case GLOBAL_PROCESS_COMMAND.stoppedCommand():
                    shutdownCalled = true
                    childrenTerminated += 1
                    MainShutdown.save(message.data)
                    if (childrenTerminated == children) {
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

        //send config of previous run
        const resData =
            resumeData != undefined
                ? resumeData.filter(
                      format => format.format_name === formatElem.format
                  )[0]
                : undefined

        sendMessage(
            GLOBAL_PROCESS_COMMAND.startCommand(),
            {
                loggerPath: logger.getPath(),
                saveFolder: RunSettings.getSaveFolderPath(),
                folderName: RunSettings.getFolderName(),
                range: RunSettings.getRange(),
                memory: SpecSettings.getProcessMemory(),
                oldDownload: RunSettings.getOldDownload(),
                resumeData: resData
            },
            child
        )
    }
}

module.exports = {
    generate
}

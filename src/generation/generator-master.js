const child_process = require('child_process')
const SpecSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const logger = require('./../utilities/log')
const MainShutdown = require('./../shutdown/main-shutdown')

const MainProcessPhases = require('./../shutdown/phases').MainProcessPhases
const GlobalProcessCommand = require('./../utilities/process')
    .GlobalProcessCommand
const FormatNamesConstants = require('./../utilities/constants/files-name-constants')
    .FormatNamesConstants
const { move } = require('./../no-layout/placer')
const { sendMessage } = require('./../utilities/process')

function generate(resumeData) {
    MainShutdown.changePhase(MainProcessPhases.GenerationPhase())

    const workers = new Map()
    var children = 0
    var childrenTerminated = 0
    var shutdownCalled = false

    const format = []
    format.push(
        processObject(
            './build/generation/json/json-generator',
            FormatNamesConstants.jsonFormat()
        ),
        processObject(
            './build/generation/pajek/pajek-generator',
            FormatNamesConstants.pajekFormat()
        )
    )
    /*
    const format = [
        './build/generation/json/json-generator'
    ]*/

    SpecSettings.setProcessMemory(
        Math.ceil(SpecSettings.getGlobalMemory() / format.length)
    )

    format.forEach(elem => startWorker(elem))

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
                case GlobalProcessCommand.endCommand():
                    sendMessage(
                        GlobalProcessCommand.endCommand(),
                        undefined,
                        workers.get(message.pid)
                    )
                    childrenTerminated += 1
                    if (childrenTerminated == children) {
                        if (shutdownCalled || !MainShutdown.isRunning()) {
                            MainShutdown.save(message.data)
                            MainShutdown.terminate()
                        } else {
                            move()
                        }
                    }
                    break
                case GlobalProcessCommand.stoppedCommand():
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

        const resData =
            resumeData != undefined
                ? resumeData.filter(
                      format => format.format_name === formatElem.format
                  )[0]
                : undefined

        sendMessage(
            GlobalProcessCommand.startCommand(),
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

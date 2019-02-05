const GlobalProcessCommand = Object.freeze({
    startCommand: () => 'start',
    stoppedCommand: () => 'stopped',
    endCommand: () => 'end'
})

const DownloadProcessCommand = Object.freeze({
    configCommand: () => 'config',
    newTaskCommand: () => 'new Task'
})

function sendMessage(command, data = undefined, receiver = undefined) {
    const rec = receiver != undefined ? receiver : process
    rec.send({
        pid: process.pid,
        command: command,
        data: data
    })
}

module.exports = {
    GlobalProcessCommand,
    DownloadProcessCommand,
    sendMessage
}

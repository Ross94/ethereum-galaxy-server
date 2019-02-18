const LineByLineReader = require('line-by-line')
const execSync = require('child_process').execSync
const SpecSettings = require('../utilities/settings/spec-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')

module.exports = (filepath, phase, parseLogic, callback) => {
    /*there is a proportion of 5000000 of lines for each 1000 MB this params as been tuned.
    This method has been called on temp file and nodes file, so you can read 2500000 lines form temp and 2500000 from nodes
    */
    const tunedMemory = 1000
    const tunedLines = 2500000
    /*
    chunkSize is the number of lines for each block, it is a proportion, 2500000 for 1000 mb for available memory 
    */
    const chunkSize = Math.ceil(
        tunedLines * SpecSettings.getProcessMemory() / tunedMemory
    )
    const linesNumber = parseInt(execSync('wc -l < ' + filepath).toString())
    const blocks =
        filepath === RecoverySettings.getCurrentFilepath() &&
        phase === RecoverySettings.getCurrentReadPhase()
            ? Math.ceil(
                  (linesNumber - RecoverySettings.getLastLine()) / chunkSize
              )
            : Math.ceil(linesNumber / chunkSize)
    var reader
    var blocksReaded = 0
    var readedLine = 0
    var lines = []

    var skippedLine = 0

    function initialization() {
        reader = new LineByLineReader(filepath)
        reader.pause()
        reader.on('line', function(line) {
            if (
                skippedLine < RecoverySettings.getLastLine() &&
                filepath === RecoverySettings.getCurrentFilepath() &&
                phase === RecoverySettings.getCurrentReadPhase()
            ) {
                skippedLine++
            } else {
                const elements = parseLogic(line)
                lines.push(elements)
                readedLine++
                const remainingLines =
                    filepath === RecoverySettings.getCurrentFilepath() &&
                    phase === RecoverySettings.getCurrentReadPhase()
                        ? linesNumber -
                          RecoverySettings.getLastLine() -
                          blocksReaded * chunkSize
                        : linesNumber - blocksReaded * chunkSize

                if (
                    readedLine ==
                    (remainingLines > chunkSize ? chunkSize : remainingLines)
                ) {
                    blocksReaded++
                    readedLine = 0
                    reader.pause()
                    const copy = lines
                    lines = []
                    if (blocksReaded == blocks) {
                        callback(copy, { endFile: true })
                    } else {
                        callback(copy, { endFile: false })
                    }
                }
            }
        })
    }

    initialization()

    function nextLines() {
        if (linesNumber == 0) {
            callback([], { endFile: true })
        } else {
            reader.resume()
        }
    }

    return {
        nextLines
    }
}

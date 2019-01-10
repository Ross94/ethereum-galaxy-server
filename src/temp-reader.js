const LineByLineReader = require('line-by-line')
const execSync = require('child_process').execSync
const constraints = require('./constraints')

module.exports = (filepath, parseLogic, callback) => {
    const path = filepath

    /*there is a proportion of 5000000 of lines for each 1000 MB this params as been tuned.
    This method has been called on temp file and nodes file, so you can read 2500000 lines form temp and 2500000 from nodes
    */
    const tunedMemory = 1000
    const tunedLines = 2500000
    /*memory is give in bytes division by 1000000 is need for convertion to MB.
      constraints.getProcessNum() rappresents the number of process running at the same time.
      For example if i want json and pajek files there will be 2 aggregator at the same time, one for json and another for pajek, i divide 
      the memory available between them.
    */
    const availableMemory =
        (constraints.getMemory() != undefined
            ? constraints.getMemory()
            : Math.ceil(require('os').freemem() / 1000000)) /
        constraints.getProcessNum()
    const chunkSize = Math.ceil(tunedLines * availableMemory / tunedMemory)
    const linesNumber = execSync('wc -l < ' + filepath)
    const blocks = Math.ceil(linesNumber / chunkSize)

    var reader
    var blocksReaded = 0
    var readedLine = 0
    var lines = []

    function initialization() {
        reader = new LineByLineReader(filepath)
        reader.pause()
        reader.on('line', function(line) {
            const elements = parseLogic(line)
            lines.push(elements)
            readedLine++
            const remainingLines = linesNumber - blocksReaded * chunkSize
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

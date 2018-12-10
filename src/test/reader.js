const LineByLineReader = require('line-by-line')
const execSync = require('child_process').execSync

module.exports = (filepath, parseLogic, callback) => {
    const path = filepath
    //const chunkSize = 2
    const chunkSize = 2000000
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

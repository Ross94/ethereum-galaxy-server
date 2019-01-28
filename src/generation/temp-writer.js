const fs = require('fs')

module.exports = (filepath, cb) => {
    const writer = fs.createWriteStream(filepath, { flags: 'a' })

    function writeArray(array, cb) {
        if (array.length != 0) {
            var writed = 0
            array.forEach(e =>
                writer.write(e, () => {
                    writed++
                    if (writed == array.length) {
                        cb()
                    }
                })
            )
        } else {
            cb()
        }
    }

    function write(elem) {
        writer.write(elem)
    }

    writer.on('open', function() {
        cb({
            writeArray,
            write
        })
    })

    /*return {
        writeArray,
        write
    }*/
}

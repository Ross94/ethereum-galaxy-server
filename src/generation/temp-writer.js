const fs = require('fs')

module.exports = filepath => {
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

    return {
        writeArray,
        write
    }
}

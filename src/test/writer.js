const fs = require('fs')

module.exports = filepath => {
    const writer = fs.createWriteStream(filepath, { flags: 'a' })

    function writeArray(array, cb) {
        var writed = 0
        array.forEach(e =>
            writer.write(e, () => {
                writed++
                if (writed == array.length) {
                    cb()
                }
            })
        )
    }

    return {
        writeArray
    }
}

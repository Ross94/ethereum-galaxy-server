var format = 'undefined format name'

module.exports = Object.freeze({
    setFormat: (formatName: string) => {
        format = formatName
    },
    getFormat: () => {
        return format
    }
})

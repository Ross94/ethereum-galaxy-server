var format = 'undefined format name'

module.exports = {
    setFormat: (formatName: string) => {
        format = formatName
    },
    getFormat: () => {
        return format
    }
}

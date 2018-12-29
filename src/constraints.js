var saveFolder = undefined
var downloadType = undefined

const Constraints = (module.exports = {
    setSaveFolder: (path: string) => {
        saveFolder = path
    },
    getSaveFolder: () => {
        return saveFolder
    },
    setDownloadType: DownloadType => {
        downloadType = DownloadType
    },
    getDownloadType: () => {
        return downloadType
    }
})

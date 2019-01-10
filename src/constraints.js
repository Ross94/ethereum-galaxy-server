var saveFolder = undefined
var folderName = undefined
var memory = 1400
var range = undefined

const Constraints = (module.exports = {
    setSaveFolder: (path: string) => {
        saveFolder = path
    },
    getSaveFolder: () => {
        return saveFolder
    },
    setFolderName: (name: string) => {
        folderName = name
    },
    getFolderName: () => {
        return folderName
    },
    setMemory: (memorySize: number) => {
        memory = memorySize
    },
    getMemory: () => {
        return memory
    },
    setRange: r => {
        range = r
    },
    getRange: () => {
        return range
    }
})

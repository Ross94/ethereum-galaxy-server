var saveFolder = undefined

const Constraints = (module.exports = {
    setSaveFolder: (path: string) => {
        saveFolder = path
    },
    getSaveFolder: () => {
        return saveFolder
    }
})

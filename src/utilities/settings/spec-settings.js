var processMemory = undefined
var workers = undefined

module.exports = Object.freeze({
    setProcessMemory: (memory: number) => {
        processMemory = memory
    },
    getProcessMemory: () => {
        return processMemory
    },
    setDownloadWorkers: (downloadWorkers: number) => {
        workers = downloadWorkers
    },
    getDownloadWorkers: () => {
        return workers
    }
})

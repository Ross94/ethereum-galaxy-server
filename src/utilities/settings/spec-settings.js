var globalMemory = undefined
var processMemory = undefined

const SpecSettings = (module.exports = {
    setGlobalMemory: (memory: number) => {
        globalMemory = memory
    },
    getGlobalMemory: () => {
        return globalMemory
    },
    setProcessMemory: (memory: number) => {
        processMemory = memory
    },
    getProcessMemory: () => {
        return processMemory
    }
})

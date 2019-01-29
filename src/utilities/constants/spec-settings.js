var processNum = 1
var memory = undefined

const SpecSettings = (module.exports = {
    setProcessNum: (processes: number) => {
        processNum = processes
    },
    getProcessNum: () => {
        return processNum
    },
    setMemory: (mem: number) => {
        memory = mem
    },
    getMemory: () => {
        return memory
    }
})

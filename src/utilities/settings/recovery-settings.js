var requestedData = undefined
var lastLine = 0
var currentFilepath = undefined
var currentReadPhase = undefined

module.exports = {
    setRequestedData: (data: string) => {
        requestedData = data
    },
    getRequestedData: () => {
        return requestedData
    },
    setLastLine: (last: number) => {
        lastLine = last
    },
    getLastLine: () => {
        return lastLine
    },
    setCurrentFilepath: (filepath: string) => {
        currentFilepath = filepath
    },
    getCurrentFilepath: () => {
        return currentFilepath
    },
    setCurrentReadPhase: (phase: string) => {
        currentReadPhase = phase
    },
    getCurrentReadPhase: () => {
        return currentReadPhase
    }
}

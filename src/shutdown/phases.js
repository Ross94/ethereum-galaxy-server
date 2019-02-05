const MainProcessPhases = Object.freeze({
    ParsePhase: () => 'Parse',
    DownloadPhase: () => 'Download',
    GenerationPhase: () => 'Generation'
})

const GenerationProcessPhases = Object.freeze({
    SplitPhase: () => 'Split'
})

module.exports = {
    MainProcessPhases,
    GenerationProcessPhases
}

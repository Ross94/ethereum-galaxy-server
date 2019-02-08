const MainProcessPhases = Object.freeze({
    ParsePhase: () => 'Parse',
    DownloadPhase: () => 'Download',
    GenerationPhase: () => 'Generation'
})

const GenerationProcessPhases = Object.freeze({
    SplitPhase: () => 'Split',
    NodesPhase: () => 'Nodes',
    TransactionsPhase: () => 'Transactions',
    ComposePhase: () => 'Compose'
})

module.exports = {
    MainProcessPhases,
    GenerationProcessPhases
}

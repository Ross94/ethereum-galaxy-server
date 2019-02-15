const MainProcessPhases = Object.freeze({
    ParsePhase: () => 'Parse',
    DownloadPhase: () => 'Download',
    GenerationPhase: () => 'Generation'
})

const GenerationProcessPhases = Object.freeze({
    SplitPhase: () => 'Split',
    NodesPhase: () => 'Nodes',
    TransactionsPhase: () => 'Transactions',
    ComposeNodesPhase: () => 'Compose Nodes',
    ComposeTransactionsPhase: () => 'Compose Transactions',
    TerminatedPhase: () => 'Terminated'
})

module.exports = {
    MainProcessPhases,
    GenerationProcessPhases
}

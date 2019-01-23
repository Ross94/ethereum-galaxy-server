//live version
const howOftenToRun = process.env.ETH_HOURS || 1

const baseFilename = () => `eth-${howOftenToRun}/${new Date().getHours()}`

const jsonFilename = () => `./graphs/layout/${baseFilename()}/graph.json`
const infoFilename = () => `./graphs/layout/${baseFilename()}/info.json`
const pajekFilename = () => `./graphs/layout/${baseFilename()}/graph.net`

const ngraphBasePath = () => `./graphs/layout/${baseFilename()}/ngraph/`
const logFilename = () => `./logs/layout/${baseFilename()}.log`

//no layout version
const logNoLayoutAll = () => './logs/no-layout/all/'
const logNoLayoutTime = () => './logs/no-layout/time/'
const logNoLayoutBlock = () => './logs/no-layout/block/'
const logLayoutServer = () => './logs/layout/server/'

const graphNoLayoutAll = () => './graphs/no-layout/all/'
const graphNoLayoutTime = () => './graphs/no-layout/time/'
const graphNoLayoutBlock = () => './graphs/no-layout/block/'
const graphNoLayoutTemporary = () => './graphs/no-layout/temporary/'

const nodesJsonName = () => 'nodes.json'
const transactionsJsonName = () => 'transactions.json'

const nodesPajekName = () => 'nodes.net'
const transactionsPajekName = () => 'transactions.net'

const jsonGraphName = () => 'graph.json'
const infoName = () => 'info.json'
const pajekGraphName = () => 'graph.net'

module.exports = {
    baseFilename,
    jsonFilename,
    infoFilename,
    pajekFilename,
    ngraphBasePath,
    logFilename,
    logNoLayoutAll,
    logNoLayoutTime,
    logNoLayoutBlock,
    logLayoutServer,
    graphNoLayoutAll,
    graphNoLayoutTime,
    graphNoLayoutBlock,
    graphNoLayoutTemporary,
    nodesJsonName,
    transactionsJsonName,
    nodesPajekName,
    transactionsPajekName,
    jsonGraphName,
    infoName,
    pajekGraphName
}

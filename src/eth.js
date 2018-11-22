const Web3 = require('web3')
const _ = require('lodash')
const saveGraph = require('ngraph.tobinary')

const { ensureDirExists, deleteFile } = require('./utils')
const {
    baseFilename,
    jsonFilename,
    infoFilename,
    pajekFilename,
    ngraphBasePath,
    customFilename
} = require('./config')
const { dumpJSON, dumpPajek, dumpInfo, dumpTransactions } = require('./files')
const logger = require('./log')
const calculateNgraphLayout = require('./ngraph-layout')

export type Range = {
    start: number,
    end: number
}

export type Node = {
    id: string
}

export type Link = {
    source: string,
    target: string,
    amount: number
}

export type Graph = {
    nodes: Node[],
    links: Link[]
}

module.exports = (infuraApiKey: string) => {
    const web3 = new Web3(
        Web3.givenProvider || `https://mainnet.infura.io/${infuraApiKey}:8546`
    )

    async function queryBlocks(blocksIndexes, cb = () => {}) {
        //download blocks
        const blocksPromises = blocksIndexes.map(x =>
            web3.eth
                .getBlock(x, true)
                .then(block => {
                    cb()
                    return block
                })
                .catch(err => {
                    cb()
                    logger.error(`Error retrieving getBlock(${x}): ${err}`)
                    return null
                })
        )

        //get blocks from Promises
        const blocks = _.compact(await Promise.all(blocksPromises))

        //get transactions from blocks
        const onlyTransactions = blocks.map(b => ({
            transactions: b.transactions
                .map(t => transformTransaction(t, web3.utils.fromWei))
                .filter(
                    t => t.amount > 0 && t.source !== null && t.target !== null
                )
        }))
        return onlyTransactions
    }

    function transformTransaction(transaction, convertWei) {
        return {
            source: transaction.from,
            target: transaction.to,
            amount: convertWei(transaction.value)
        }
    }

    async function scanBlocks(range: Range, doLayout: boolean = true) {
        logger.log('Retrieving blocks...')
        //create an array, size = end - start
        const blocksIndexes = Array(range.end - range.start)
            .fill(1)
            .map((one, index) => range.start + one + (index - 1))

        //divide array in chunck of 240 elems
        const blocksIndexesAtATime = _.chunk(blocksIndexes, 240)

        const blockChunks = []
        for (let i = 0; i < blocksIndexesAtATime.length; i++) {
            const blocksIndexes = blocksIndexesAtATime[i]
            const progressBar = logger.progress(
                `Retrieving chunk ${i + 1} of ${
                    blocksIndexesAtATime.length
                }...`,
                blocksIndexes.length
            )
            const blocksChunk = await queryBlocks(blocksIndexes, () =>
                progressBar.tick()
            )

            blockChunks.push(blocksChunk)
        }
        const blocks = _.flatten(blockChunks)

        const cleanedBlocks = _.compact(blocks) // I don't think we need this

        logger.log('Processing transactions...')
        const transactions = _.flatten(
            cleanedBlocks
                .filter(block => block.transactions.length > 0)
                .map(block => block.transactions)
        )

        // const minifiedTransactions = transactions
        //     .map(transaction =>
        //         transformTransaction(transaction, web3.utils.fromWei)
        //     )
        //     .filter(t => t.amount > 0)

        logger.log('Processing nodes...')

        //get source and target from stransactions and merge them
        const sourceIds = transactions.map(t => t.source)
        const targetIds = transactions.map(t => t.target)
        const nodeIds = _.uniq(_.compact(_.union(sourceIds, targetIds)))

        const nodes = nodeIds.map(id => ({ id }))

        logger.log('Calculating layout...')

        const graph = { nodes, links: transactions }

        if (doLayout) {
            const ngraphOutDirPath = ngraphBasePath()
            ensureDirExists(ngraphOutDirPath)
            const ngraph = await calculateNgraphLayout(graph, ngraphOutDirPath)

            saveGraph(ngraph, {
                outDir: ngraphOutDirPath,
                labels: `labels.json`,
                meta: `meta.json`,
                links: `links.bin`
            })
        }

        logger.log('Exporting the graph to JSON...')

        dumpJSON(jsonFilename(), graph)

        logger.log('Export the graph infos...')

        dumpInfo(infoFilename(), graph, range)

        logger.log('Exporting the graph to Pajek...')

        dumpPajek(pajekFilename(), graph)

        logger.log('Finished, cya')
    }

    function initializeBlockSpace(start, end) {
        return Array(end - start)
            .fill(1)
            .map((one, index) => start + one + (index - 1))
    }
    /*
    async function scanBlocksGroupped(range: Range) {
        deleteFile(customFilename())

        const chunkSize = 240
        const round = Math.ceil((range.end - range.start) / chunkSize)

        logger.log('Retrieving blocks...')

        for (var i = 0; i < round; i++) {
            //initialize transactions structure (every element is a set of transactions)
            const s = range.start + i * chunkSize
            const e = s + chunkSize > range.end ? range.end : s + chunkSize
            const blocksIndexes = initializeBlockSpace(s, e)
            const progressBar = logger.progress(
                `Retrieving chunk ${i + 1} of ${round}...`,
                blocksIndexes.length
            )

            //Get transactions
            const blocksChunk = await queryBlocks(blocksIndexes, () =>
                progressBar.tick()
            )

            //processing transactions
            const transactions = _.flatten(
                blocksChunk
                    .filter(block => block.transactions.length > 0)
                    .map(block => block.transactions)
            ).map(t => t.source + ':' + t.target + ':' + t.amount)

            //write transaction
            dumpTransactions(customFilename(), transactions)
        }

        logger.log('Finished, cya')
    }*/

    async function lastBlock() {
        const syncResult = await web3.eth.isSyncing()
        if (syncResult) {
            return syncResult.currentBlock
        } else {
            const lastBlockNumber = await web3.eth.getBlockNumber()
            return lastBlockNumber
        }
    }

    return {
        queryBlocks,
        scanBlocks,
        //scanBlocksGroupped,
        lastBlock
    }
}

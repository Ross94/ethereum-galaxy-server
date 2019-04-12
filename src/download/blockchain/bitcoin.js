const execSync = require('child_process').execSync

const { timestampToDate } = require('./../../utilities/date-utils')

async function lastBlockId() {
    const last = JSON.parse(
        execSync('curl -s https://blockchain.info/latestblock').toString()
    )

    return last.height
}

async function getBlockTime(blockId) {
    const block = JSON.parse(
        execSync(
            'curl -s https://blockchain.info/block-height/' +
                blockId +
                '?format=json'
        ).toString()
    )

    return timestampToDate(block.blocks[0].time)
}

async function getTransactions(blocksIndexes, cb = () => {}) {
    const SATOSHI_VALUE = 100000000
    const transactions = []

    blocksIndexes.forEach(bid => {
        const bs = JSON.parse(
            execSync(
                'curl -s https://blockchain.info/block-height/' +
                    bid +
                    '?format=json'
            ).toString()
        )

        bs.blocks.forEach(block => {
            const txs = block.tx
            txs.forEach(t => {
                const inputs = []
                const outputs = []

                var total = 0

                if (t.inputs[0].prev_out != undefined) {
                    t.inputs.forEach(i =>
                        inputs.push({
                            address: i.prev_out.addr,
                            amount: i.prev_out.value
                        })
                    )
                    t.out.forEach(o => {
                        total += o.value
                        outputs.push({ address: o.addr, amount: o.value })
                    })

                    inputs.forEach(i => {
                        outputs.forEach(o => {
                            const t = {
                                source: i.address,
                                target: o.address,
                                amount:
                                    i.amount / total * o.amount / SATOSHI_VALUE
                            }
                            transactions.push(JSON.stringify(t))
                        })
                    })
                }
            })
        })
    })

    return transactions
}

module.exports = {
    lastBlockId,
    getBlockTime,
    getTransactions
}

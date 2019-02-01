const jsonfile = require('jsonfile')
const fs = require('fs')

const logger = require('./../utilities/log')
const { ensureDirExists } = require('./../utilities/utils')

import type { Graph, Node, Link, Range } from './../ethereum/eth'

var transactionStream

function dumpJSON(filepath: string, graph: Graph) {
    ensureDirExists(filepath)

    jsonfile.writeFileSync(filepath, graph)
}

function dumpInfo(filepath: string, { nodes, links }: Graph, range: Range) {
    ensureDirExists(filepath)

    const info = {
        range,
        nodes_number: nodes.length,
        links_number: links.length
    }

    jsonfile.writeFileSync(filepath, info, { spaces: 2 })
}

function dumpPajek(filepath: string, { nodes, links }: Graph) {
    ensureDirExists(filepath)

    const nodesMap: Map<string, number> = new Map()
    let str = ''

    str += `*Vertices ${nodes.length}\n`
    str += nodes.reduce((acc, curr, index) => {
        nodesMap.set(curr.id, index + 1)
        return acc + `${index + 1} "${curr.id}"\n`
    }, '')
    str += '*arcs\n'
    str += links.reduce((acc, curr, index) => {
        const source = nodesMap.get(curr.source)
        const target = nodesMap.get(curr.target)
        if (!source || !target) {
            throw new Error('Source or target null')
        }
        return acc + `${source} ${target} ${curr.amount}\n`
    }, '')

    fs.writeFileSync(filepath, str)
}

function saveInfo(filepath: string, data: string) {
    ensureDirExists(filepath)

    jsonfile.writeFileSync(filepath, data, { spaces: 2 })
}

function setTransactionStream(filepath: string, cb) {
    ensureDirExists(filepath)

    transactionStream = fs.createWriteStream(filepath, { flags: 'a' })

    transactionStream.on('open', function() {
        cb()
    })
}

function dumpTransactions(transactions: string[], cb) {
    var writed = 0
    transactions.map(e => e + '\n').forEach(e => {
        transactionStream.write(e, () => {
            writed++
            if (writed == transactions.length) {
                cb()
            }
        })
    })
}

module.exports = {
    dumpJSON,
    dumpInfo,
    dumpPajek,
    saveInfo,
    setTransactionStream,
    dumpTransactions,
    ensureDirExists
}

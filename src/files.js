const jsonfile = require('jsonfile')
const fs = require('fs')

const logger = require('./log')
const { ensureDirExists } = require('./utils')

import type { Graph, Node, Link, Range } from './eth'

var transactionStream

function dumpJSON(filepath: string, graph: Graph) {
    ensureDirExists(filepath)

    jsonfile.writeFile(filepath, graph, err => {
        if (err) logger.error(err)
    })
}

function dumpInfo(filepath: string, { nodes, links }: Graph, range: Range) {
    ensureDirExists(filepath)

    const info = {
        range,
        nodes_number: nodes.length,
        links_number: links.length
    }

    jsonfile.writeFile(filepath, info, { spaces: 2 }, err => {
        if (err) logger.error(err)
    })
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

    fs.writeFile(filepath, str, err => {
        if (err) logger.error(err)
    })
}

function saveInfo(filepath: string, range: Range) {
    ensureDirExists(filepath)

    const data = {
        range: range
    }

    jsonfile.writeFile(filepath, data, { spaces: 2 }, err => {
        if (err) logger.error(err)
    })
}

function setTransactionStream(filepath: string) {
    ensureDirExists(filepath)

    transactionStream = fs.createWriteStream(filepath, { flags: 'a' })
}
function dumpTransactions(transactions: string[], cb) {
    var writed = 0
    transactions.map(e => e + '\n').forEach(e =>
        transactionStream.write(e, () => {
            writed++
            if (writed == transactions.length) {
                cb
            }
        })
    )
}
/*
function dumpTransactions(transactions: string[]) {
    transactions.forEach(t => transactionStream.write(t + '\n'))
}*/

module.exports = {
    saveInfo,
    setTransactionStream,
    dumpTransactions,
    dumpJSON,
    dumpInfo,
    dumpPajek,
    ensureDirExists
}

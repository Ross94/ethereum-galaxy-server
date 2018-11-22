const fs = require('fs')
const reader = require('./reader')
const writer = require('./writer')
//lo creo sempre da zero, poi cancello il vecchio e lo rinomino, non è il top, ma andare a scrivere a metà il file mentre si legge credo sia infattibile

const resPath = 'res.json'
const tempPath = 'temp.json'
const nodePath = 'nodes.json'
const transactionPath = 'transactions.json'
const tempWriter = writer(tempPath)

const jsonLines = {
    open: '{"nodes":[',
    mid: '],"links":[',
    close: ']}'
}

var lineReader = createReader(nodePath)
var l = undefined

function createReader(filepath) {
    return require('readline').createInterface({
        input: require('fs').createReadStream(filepath)
    })
}

function commonLine(line) {
    tempWriter.write('\t\t' + line + ',\n')
}

function lastLine(line) {
    tempWriter.write('\t\t' + line + '\n')
}

function nodePhase() {
    lineReader
        .on('line', function(line) {
            if (l != undefined) commonLine(l)
            l = line
        })
        .on('close', function() {
            if (l != undefined) lastLine(l)
            tempWriter.write('\t' + jsonLines.mid + '\n')
            transactionPhase()
        })
}

function transactionPhase() {
    lineReader = createReader(transactionPath)
    l = undefined
    lineReader
        .on('line', function(line) {
            if (l != undefined) commonLine(l)
            l = line
        })
        .on('close', function() {
            if (l != undefined) lastLine(l)
            tempWriter.write(jsonLines.close + '\n')
            fs.unlinkSync(resPath)
            fs.renameSync(tempPath, resPath)
        })
}

tempWriter.write(jsonLines.open + '\n')
nodePhase()

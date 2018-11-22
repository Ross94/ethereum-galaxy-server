const fs = require('fs')
const reader = require('./reader')
const writer = require('./writer')

const resPath = 'res.json'
const nodePath = 'nodes.json'
const transactionPath = 'transactions.json'

const nodeWriter = writer(nodePath)
const transactionWriter = writer(transactionPath)

const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(resPath)
})

function checkResourceExists(resourcepath) {
    return fs.existsSync(resourcepath)
}

function createFile(fileName) {
    fs.closeSync(fs.openSync(fileName, 'w'))
}

function convertToRow(elem) {
    return JSON.stringify(elem) + '\n'
}

function addToFile(elem) {
    if (elem.id != undefined) {
        nodeWriter.write(convertToRow(elem))
    } else {
        transactionWriter.write(convertToRow(elem))
    }
}

if (checkResourceExists(resPath)) {
    lineReader.on('line', function(line) {
        try {
            var elem = JSON.parse(line.slice(0, -1))
            addToFile(elem)
        } catch (err) {
            try {
                elem = JSON.parse(line)
                addToFile(elem)
            } catch (err) {}
        }
    })
} else {
    createFile(resPath)
    createFile(nodePath)
    createFile(transactionPath)
}

const Web3 = require('web3')
const _ = require('lodash')
const fs = require('fs')

async function download(blocksIndexes) {
    const blocksPromises = blocksIndexes.map(x =>
        web3.eth
            .getBlock(x, true)
            .then(block => {
                return block.difficulty
            })
            .catch(err => {
                logger.error(`Error retrieving getBlock(${x}): ${err}`)
                return null
            })
    )

    //get blocks from Promises
    return _.compact(await Promise.all(blocksPromises))
}

function askTask() {
    process.send({
        pid: process.pid,
        command: 'new task'
    })
}

var stream
var web3

process.on('message', function(message) {
    switch (message.command) {
        case 'config':
            const filepath = './build/test/parallel/' + message.filename
            web3 = new Web3(
                Web3.givenProvider ||
                    `https://mainnet.infura.io/${message.api}:8546`
            )
            //delete old directory, error if does not exit, but still work
            fs.unlink(filepath, err => {
                if (err) console.log(err)
            })
            //create path
            if (!fs.existsSync('./build/test/parallel/')) {
                fs.mkdirSync('./build/test/parallel/')
            }
            //create file
            stream = fs.createWriteStream(filepath, { flags: 'a' })
            askTask()
            break
        case 'task':
            download(message.task).then(data => {
                data.forEach(t => stream.write(t + '\n'))
                askTask()
            })
            break
        case 'end':
            stream.end()
            console.log('[child ' + process.pid + '] no more task, bye!')
            process.disconnect()
            break
        default:
            console.log(
                '[child ' + process.pid + '] wrong command + ' + message.command
            )
    }
})

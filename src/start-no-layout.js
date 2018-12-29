const argv = require('named-argv')
const createEth = require('./eth')
const startManager = require('./manager')
const downloadType = require('./enum').DOWNLOAD_TYPE
const { dateComparator } = require('./utils')

const params = argv.opts

var time = 0
var block = 0
var all = 0

var eth

function main() {
    if (params.api != undefined) {
        eth = createEth(params.api)
        eth.lastBlock().then(lastBlock => {
            //in this part check params and select the method to extract indexes
            if (
                checkDateFormat(params.firstDate) &&
                checkDateFormat(params.lastDate) &&
                dateComparator(params.firstDate, params.lastDate) > 0
            ) {
                time = 1
            }
            if (
                params.firstBlock >= 0 &&
                params.lastBlock <= lastBlock &&
                params.lastBlock > params.firstBlock
            ) {
                block = 1
            }
            if (params.all) {
                all = 1
            }
            if (time + block + all != 1) {
                console.log(
                    'Wrong params, choose one of these:\n' +
                        '-firstBlock:int -lastBlock:int\n' +
                        '-firstDate:DD-MM-YYYY -lastDate:DD-MM-YYYY\n' +
                        '-all\n\n' +
                        'Control params format and last greater than first'
                )
            } else {
                if (time == 1) {
                    startManager(params.api, downloadType.TIME, {
                        firstDate: params.firstDate,
                        lastDate: params.lastDate
                    })
                }
                if (block == 1) {
                    startManager(params.api, downloadType.BLOCK, {
                        firstBlock: params.firstBlock,
                        lastBlock: params.lastBlock
                    })
                }
                if (all == 1) {
                    startManager(params.api, downloadType.ALL, {})
                }
            }
        })
    } else {
        console.log('Wrong infuraApiKey, param -api=infuraApiKey')
    }
}

function checkDateFormat(date) {
    if (typeof date === 'string') {
        const parts = date.split('-').map(e => parseInt(e))
        if (parts[2] >= 0) {
            switch (parts[1]) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    if (parts[0] <= 31) {
                        return true
                    }
                    break
                case 2:
                    const bis = parts[2] % 4 == 0 ? 1 : 0
                    if (parts[0] <= 28 + bis) {
                        return true
                    }
                    break
                case 4:
                case 6:
                case 9:
                case 11:
                    if (parts[0] <= 30) {
                        return true
                    }
                    break
            }
        }
    }
    return false
}

main()

const argv = require('named-argv')
const Web3 = require('web3')

const params = argv.opts

var time = 0
var block = 0
var all = 0

var web3

const PrecisionStandard = {
    FIRST: (index, precision) => index - precision,
    LAST: (index, precision) => index + precision
}

function main() {
    if (params.api != undefined) {
        web3 = new Web3(
            Web3.givenProvider || `https://mainnet.infura.io/${params.api}:8546`
        )
        lastBlock().then(lastBlock => {
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
                        '-firstDate:DD/MM/YYYY -lastDate:DD/MM/YYYY\n' +
                        '-all'
                )
            } else {
                //based on previous check extract indexes
                if (time == 1) {
                    const firstBlockDate = '30/07/2015'

                    blockToDate(lastBlock).then(lastDate => {
                        if (
                            dateComparator(firstBlockDate, params.firstDate) >=
                                0 &&
                            dateComparator(lastDate, params.lastDate) <= 0
                        ) {
                            Promise.all([
                                dateToBlock(
                                    params.firstDate,
                                    PrecisionStandard.FIRST
                                ),
                                dateToBlock(
                                    params.lastDate,
                                    PrecisionStandard.LAST
                                )
                            ]).then(values => {
                                downloadPahse(values[0], values[1])
                            })
                        } else {
                            console.log(
                                'Wrong params, firstDate must be after ' +
                                    firstBlockDate +
                                    ' and lastDate before ' +
                                    lastDate
                            )
                        }
                    })
                }
                if (block == 1) {
                    downloadPahse(params.firstBlock, params.lastBlock)
                }
                if (all == 1) {
                    downloadPahse(0, lastBlock)
                }
            }
        })
    } else {
        console.log('Wrong infuraApiKey, param -api=infuraApiKey')
    }
}

//import from eth.js
async function lastBlock() {
    const syncResult = await web3.eth.isSyncing()
    if (syncResult) {
        return syncResult.currentBlock
    } else {
        const lastBlockNumber = await web3.eth.getBlockNumber()
        return lastBlockNumber
    }
}

//get date from block
async function blockToDate(blockId) {
    const block = await web3.eth.getBlock(blockId)
    const date = new Date(block.timestamp * 1000)
    return (
        date.getUTCDate() +
        '/' +
        (parseInt(date.getUTCMonth()) + 1) +
        '/' +
        date.getUTCFullYear()
    )
}

/*compare two date in dd/mm/yyyy format int as result
* 0 	-> equals
* < 0 	-> date1 later
* > 0	-> date2 later
*/
function dateComparator(date1, date2) {
    function process(date) {
        const parts = date.split('/')
        return new Date(parts[2], parts[1] - 1, parts[0])
    }
    return process(date2) - process(date1)
}

//get first index in one date
function dateToBlock(date, PrecisionStandard) {
    return lastBlock().then(lastBlockDate => {
        const range = {
            lowerBound: 0,
            upperBound: lastBlockDate
        }

        return binaryIndexSearch(range, date, PrecisionStandard)
    })
}

//binary search implementation on blockchain
function binaryIndexSearch(range, date, PrecisionStandard) {
    const index = parseInt((range.upperBound + range.lowerBound) / 2)
    return blockToDate(index).then(blockDate => {
        const compare = dateComparator(blockDate, date)
        if (compare == 0) {
            return precisionSearch(index, date, 1000, PrecisionStandard)
        }
        if (compare < 0) {
            range.upperBound = index
            return binaryIndexSearch(range, date, PrecisionStandard)
        }
        if (compare > 0) {
            range.lowerBound = index
            return binaryIndexSearch(range, date, PrecisionStandard)
        }
    })
}

/*Find first or last block index in one date
* index, to check
* date, date to exam
* precision, number of  blocks to skip
* PrecisionStandard, specify if searched last or fist block in day
*
* algorithm compare date with date of previous or next block(dependes on PrecisionStandard).
* if is the same pass the index of previuos or next and go on recursively, if date doesn't match try with skipping less blocks,
* if skipping one block change date, this is the last or first block of day, return it.
*/
function precisionSearch(index, date, precision, PrecisionStandard) {
    return blockToDate(PrecisionStandard(index, precision)).then(blockDate => {
        if (dateComparator(blockDate, date) == 0) {
            return precisionSearch(
                PrecisionStandard(index, precision),
                date,
                precision,
                PrecisionStandard
            )
        } else {
            if (precision == 1) {
                return index
            } else {
                return precisionSearch(
                    index,
                    date,
                    Math.ceil(precision / 10),
                    PrecisionStandard
                )
            }
        }
    })
}

function checkDateFormat(date) {
    if (typeof date === 'string') {
        const parts = date.split('/').map(e => parseInt(e))
        const now = new Date(Date.now())
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

function downloadPahse(start, stop) {
    console.log('start: ' + start + ' stop: ' + stop)
}

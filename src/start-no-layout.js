const argv = require('named-argv')
const colors = require('colors')
const master = require('./task-master')
const logger = require('./log')
const createEth = require('./eth')
const constraints = require('./constraints')
const {
    logNoLayoutAll,
    logNoLayoutTime,
    logNoLayoutBlock,
    graphNoLayoutAll,
    graphNoLayoutTime,
    graphNoLayoutBlock
} = require('./config')
const params = argv.opts

var time = 0
var block = 0
var all = 0

var eth
var lastBlock

const PrecisionStandard = {
    FIRST: (index, precision) => index - precision,
    LAST: (index, precision) => index + precision
}

function main() {
    if (params.api != undefined) {
        eth = createEth(params.api)
        eth.lastBlock().then(lastBlock => {
            lastBlock = lastBlock
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
                //based on previous check extract indexes
                if (time == 1) {
                    const firstBlockDate = '30-07-2015'

                    blockToDate(lastBlock).then(lastDate => {
                        if (
                            dateComparator(firstBlockDate, params.firstDate) >=
                                0 &&
                            dateComparator(lastDate, params.lastDate) < 0
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
                                constraints.setSaveFolder(graphNoLayoutTime())
                                logger.setPath(
                                    logNoLayoutTime() +
                                        params.firstDate +
                                        '-' +
                                        params.lastDate +
                                        '.log'
                                )
                                logger.log(
                                    'Log of time type with firstDate: ' +
                                        params.firstDate +
                                        ' lastDate: ' +
                                        params.lastDate
                                )
                                const workers = master(values[0], values[1])
                                workers.startWorkers(params.api)
                            })
                        } else {
                            console.log(
                                'Wrong params, firstDate start from ' +
                                    firstBlockDate +
                                    ' and lastDate before ' +
                                    lastDate
                            )
                        }
                    })
                }
                if (block == 1) {
                    constraints.setSaveFolder(graphNoLayoutBlock())
                    logger.setPath(
                        logNoLayoutBlock() +
                            params.firstBlock +
                            '-' +
                            params.lastBlock +
                            '.log'
                    )
                    logger.log(
                        'Log of block type with firstBlock: ' +
                            params.firstBlock +
                            ' lastBlock: ' +
                            params.lastBlock
                    )
                    const workers = master(
                        parseInt(params.firstBlock),
                        parseInt(params.lastBlock)
                    )
                    workers.startWorkers(params.api)
                }
                if (all == 1) {
                    constraints.setSaveFolder(graphNoLayoutAll())
                    logger.setPath(logNoLayoutAll() + 'all' + '.log')
                    logger.log('Log of all type')
                    const workers = master(0, lastBlock)
                    workers.startWorkers(params.api)
                }
            }
        })
    } else {
        console.log('Wrong infuraApiKey, param -api=infuraApiKey')
    }
}

//get date from block
function blockToDate(blockId) {
    return eth.getBlock(blockId).then(block => {
        const date = new Date(block.timestamp * 1000)
        return (
            date.getUTCDate() +
            '-' +
            (parseInt(date.getUTCMonth()) + 1) +
            '-' +
            date.getUTCFullYear()
        )
    })
}

/*compare two date in DD-MM-YYYY format int as result
 0     -> equals
 < 0   -> date1 later
 > 0   -> date2 later
*/
function dateComparator(date1, date2) {
    function process(date) {
        const parts = date.split('-')
        return new Date(parts[2], parts[1] - 1, parts[0])
    }
    return process(date2) - process(date1)
}

//get first index in one date
function dateToBlock(date, PrecisionStandard) {
    return eth.lastBlock().then(lastBlockDate => {
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
* algorithm compare date with date of previous or next block(dependes on PrecisionStandard, always called nextBlock).
* if is the same pass nextBlock recursively, if date doesn't match try with skipping less blocks,
* if skipping one block change date, this is the last or first block of day, return it.
*/
function precisionSearch(index, date, precision, PrecisionStandard) {
    var nextBlock = PrecisionStandard(index, precision)
    //check to avoid out of bound
    if (nextBlock < 0 || nextBlock > lastBlock) {
        return precisionSearch(
            index,
            date,
            Math.ceil(precision / 10),
            PrecisionStandard
        )
    }
    return blockToDate(nextBlock).then(blockDate => {
        //block 0 timestamp = 0, so it return 01-01-1970, if this happens return 0
        if (dateComparator(blockDate, '01-01-1970') == 0) {
            return 0
        }
        if (dateComparator(blockDate, date) == 0) {
            return precisionSearch(
                nextBlock,
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

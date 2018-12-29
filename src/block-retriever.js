const createEth = require('./eth')
const constraints = require('./constraints')
const { dateComparator } = require('./utils')

var eth
var lastBlock

module.exports = (infuraApiKey: string) => {
    eth = createEth(infuraApiKey)

    function dateToBlocks(params) {
        const firstBlockDate = '30-07-2015'

        return eth
            .lastBlock()
            .then(lastBlock => {
                return blockToDate(lastBlock)
            })
            .then(lastDate => {
                if (
                    dateComparator(firstBlockDate, params.firstDate) >= 0 &&
                    dateComparator(lastDate, params.lastDate) < 0
                ) {
                    return Promise.all([
                        dateToBlock(params.firstDate, PrecisionStandard.FIRST),
                        dateToBlock(params.lastDate, PrecisionStandard.LAST)
                    ]).then(values => {
                        return { first: values[0], last: values[1] }
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

    function allToBlocks() {
        return eth.lastBlock().then(lastBlock => {
            return { first: 0, last: lastBlock }
        })
    }

    return {
        dateToBlocks,
        allToBlocks
    }
}

const PrecisionStandard = Object.freeze({
    FIRST: (index, precision) => index - precision,
    LAST: (index, precision) => index + precision
})

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

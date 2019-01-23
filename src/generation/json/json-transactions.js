const logger = require('./../../utilities/log')
const reader = require('./../temp-reader')
const writer = require('./../temp-writer')

const {
    graphNoLayoutTemporary,
    transactionsJsonName
} = require('./../../utilities/config')

function jsonTransactionsAggregation(filePath, cb) {
    const transactionsPath = graphNoLayoutTemporary() + transactionsJsonName()
    const transactionsWriter = writer(transactionsPath)
    const transactionReader = reader(
        filePath,
        line => {
            return line
        },
        (lines, options) => {
            transactionsWriter.writeArray(
                lines.map(line => line + '\n'),
                () => {
                    if (options.endFile) {
                        logger.log(
                            'Termanited Json transactions copy from ' + filePath
                        )
                        cb()
                    } else {
                        transactionReader.nextLines()
                    }
                }
            )
        }
    )

    logger.log('Start Json transactions copy from ' + filePath)
    transactionReader.nextLines()
}

module.exports = {
    jsonTransactionsAggregation
}

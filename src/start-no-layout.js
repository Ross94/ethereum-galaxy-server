const commander: any = require('commander')
const colors = require('colors')
const master = require('./task-master')
const logger = require('./log')

commander
    .version('1.0.0')
    .option('-a, --api <key>', 'Infura API key')
    .option('-s, --start <n>', 'Blocks start', parseInt)
    .option('-e, --end <n>', 'Blocks end', parseInt)
    .parse(process.argv)

const requiredArgs = ['api', 'start', 'end']

const missingArgs = requiredArgs.filter(arg => commander[arg] === undefined)

if (missingArgs.length > 0) {
    logger.error(
        'Missing required argument' + (missingArgs.length > 1 ? 's' : '')
    )
    logger.args(missingArgs.join(', '))
    commander.help()
}

if (commander.start > commander.end) {
    logger.error('End must be major of start')
} else {
    if (commander.start == commander.end) {
        logger.warning('End and start are equals this will product empty files')
    }

    const infuraApiKey = commander.api

    const { startWorkers } = master(commander.start, commander.end)

    startWorkers(infuraApiKey)

    //vecchia impl
    /*
    const createEth = require('./eth')

    const infuraApiKey = commander.api

    const { scanBlocks } = createEth(infuraApiKey)

    const blockRange = {
        start: commander.start,
        end: commander.end
    }

    scanBlocks(blockRange, false)
    */
}

const commander: any = require('commander')
const colors = require('colors')

const createEth = require('./eth')

commander
    .version('1.0.0')
    .option('-a, --api <key>', 'Infura API key')
    .option('-s, --start <n>', 'Blocks start', parseInt)
    .option('-e, --end <n>', 'Blocks end', parseInt)
    .parse(process.argv)

const requiredArgs = ['api', 'start', 'end']

const missingArgs = requiredArgs.filter(arg => commander[arg] === undefined)

if (missingArgs.length > 0) {
    console.log(
        `${colors.red('ERROR:')}    Missing required argument${
            missingArgs.length > 1 ? 's' : ''
        } ${colors.blue(missingArgs.join(', '))}`
    )
    commander.help()
}

if (commander.start > commander.end) {
    console.log(`${colors.red('ERROR:')}    End must be major of start`)
} else {
    if (commander.start == commander.end) {
        console.log(
            `${colors.yellow(
                'WARNING: '
            )}  End and start are equals this will product empty files`
        )
    }
    const infuraApiKey = commander.api

    const { scanBlocks } = createEth(infuraApiKey)

    const blockRange = {
        start: commander.start,
        end: commander.end
    }

    scanBlocks(blockRange, false)
}

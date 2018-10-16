const commander: any = require('commander')
const colors = require('colors')

const createEth = require('../eth')
const Web3 = require('web3')

commander
    .version('1.0.0')
    .option('-a, --api <key>', 'Infura API key')
    .option('-e, --block <n>', 'Block number', parseInt)
    .parse(process.argv)

const requiredArgs = ['api', 'block']

const missingArgs = requiredArgs.filter(arg => commander[arg] === undefined)

if (missingArgs.length > 0) {
    console.log(
        `${colors.red('error:')}    Missing required argument${
            missingArgs.length > 1 ? 's' : ''
        } ${colors.blue(missingArgs.join(', '))}`
    )
    commander.help()
}

const web3 = new Web3(
    Web3.givenProvider || `https://mainnet.infura.io/${commander.api}:8546`
)

web3.eth.getBlock(commander.block).then(console.log)

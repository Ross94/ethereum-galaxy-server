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

web3.eth.getBlockTransactionCount(commander.block).then(number => {
    number == 0
        ? console.log('no transactions in this block')
        : web3.eth.getBlock(commander.block).then(block => {
              console.log(
                  'number of transactions: ' + block.transactions.length
              )
              for (var i = 0; i < block.transactions.length; i++) {
                  web3.eth
                      .getTransaction(block.transactions[i])
                      .then(transaction => {
                          console.log(
                              'code: ' +
                                  transaction.hash +
                                  ' from: ' +
                                  transaction.from +
                                  ' to: ' +
                                  transaction.to
                          )
                      })
              }
          })
})

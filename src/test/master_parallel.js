const commander: any = require('commander')
const colors = require('colors')
const child_process = require('child_process')

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

    function availableTask() {
        function getTask() {
            const ret = Array(
                task.end - task.start >= chunkSize
                    ? chunkSize
                    : task.end - task.start
            )
                .fill(1)
                .map((one, index) => task.start + one + (index - 1))
            task.start += chunkSize
            return ret
        }

        if (task.start < task.end) {
            return getTask()
        }
        return false
    }

    const CPUs = require('os').cpus().length //4
    const chunkSize = 4

    //everytime a thread complete a chunk read task and increment start of chunkSize value
    var task = {
        start: commander.start,
        end: commander.end
    }

    const workers = new Map()

    for (var i = 0; i < CPUs; i++) {
        var child = child_process.fork('./build/test/worker_parallel')
        workers.set(child.pid, child)
        child.send({
            command: 'config',
            filename: i + '.txt',
            api: commander.api
        })
        child.on('message', function(message) {
            switch (message.command) {
                case 'new task':
                    const res = availableTask()
                    if (!res) {
                        workers.get(message.pid).send({ command: 'end' })
                    } else {
                        workers
                            .get(message.pid)
                            .send({ command: 'task', task: res })
                    }
                    break
                default:
                    console.log(
                        '[child ' +
                            message.child +
                            '] send wrong command + ' +
                            message.command
                    )
            }
        })
    }
}

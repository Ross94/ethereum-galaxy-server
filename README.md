# Ethereum Galaxy - Server

Node.js server for [Ethereum Galaxy](https://github.com/Ross94/ethereum-galaxy).

These scripts retrieves the transactions from the ethereum blockchain and save it as a graph, where:

*   Nodes => addresses
*   Edges => transactions

Current configuration retrieves transactions divided in blocks of 1h, 4h, 6h, 12h and 24h.

The supported output formats are:

*   [Pajek](https://gephi.org/users/supported-graph-formats/pajek-net-format/)
*   [ngraph](https://github.com/anvaka/ngraph)
*   A custom JSON, example:

```
{
    "nodes": [
        { "id": "0x390dE26d772D2e2005C6d1d24afC902bae37a4bB" },
        { "id": "0x2E26035B04213530DeEeA6a3874D0f4143BcE939" }
    ],
    "links": [
        {
            "source": "0x390dE26d772D2e2005C6d1d24afC902bae37a4bB",
            "target": "0x2E26035B04213530DeEeA6a3874D0f4143BcE939",
            "amount": "0.14426006"
        }
    ]
}
```

The outputs will be inside the `graphs` folder having this structure:

```
graphs
├───eth-1                       # The graph of 1 hour of transactions
│   └───17                      # The hour when the graph was generated
|       ├───graph.json
|       ├───graph.net
│       └───ngraph
|           ├───positions.bin
|           ├───links.bin
|           ├───labels.json
|           └───meta.json
└───eth-6                       # The graph of 6 hours of transactions
```

The web server will serve the files inside the `graph` folder, with the following API:

`/graphs` returns the available graphs.

`/graphs/eth-X/Y/graph.*` returns the request graph.

## Requirements

*   Node.js
*   An [Infura](https://infura.io/) API key
*   [Pm2](http://pm2.keymetrics.io/)

Clone the repository and install the dependencies:

```
$ git clone https://github.com/loopingdoge/ethereum-galaxy-server
$ npm install
```

Build the src files:

```
$ npm run flow:build
```

Set the Infura API key:

```
$ export INFURA_API_KEY=<Your key>
```

## Usage

The server is meant to be ran using `pm2`.

```
$ pm2 start ecosystem.config.js
```

will start the server instances configured inside `ecosystem.config.js`.

By default the web server will serve on port `8888`.

### No 3D layout

By default the server will calculate a 3D layout of the graph, but this is a very CPU intensive operation. If you don't need this data you can use the `src/start-no-layout.js` script.

Help section:

```
$ node ./build/no-layout/start-no-layout.js -help
```

Show all possible commands, same as in list below.

### Block range

```
$ node ./build/no-layout/start-no-layout.js -api=<INFURA_API_KEY> -firstBlock=1999998 -lastBlock=2000000
```

will generate the graph of the blocks in the range of 1999998-2000000.

---

### Date range

```
$ node ./build/no-layout/start-no-layout.js -api=<INFURA_API_KEY> -firstDate=01-12-2016 -lastDate=31-12-2016
```

will generate the graph of the blocks in the range of 01-12-2016-31-12-2016.

---

### All transactions

```
$ node ./build/no-layout/start-no-layout.js -api=<INFURA_API_KEY> -all
```

will generate the graph of all blocks, be careful this could be very slow.

---

### Resume

```
$ node ./build/no-layout/start-no-layout.js -api=<INFURA_API_KEY> -resume
```

Resume a previous download interrupted.

---

### Optional flags

Default memory is 1400 MB for each format, total of 2800 MB.
Default download process is 1.
In order to increase memory perfomance you can use those commands:

Use all available memory (best choince to optimize performance):

```
-memory
```

Specify the total size of memory to use in MB, this value will be splitted based on number of format actual two(json and pajek):

```
-memory=number
```

Use n download workers, n is equal to processor threads (best choince to optimize performance):

```
-cpu
```

Specify the number of download workers:

```
-cpu=number
```

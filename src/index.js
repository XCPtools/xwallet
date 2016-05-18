'use strict';

exports = module.exports = {};

let xwalletServer = require('./lib/xwallet/server');
let xchain        = require('./lib/xwallet/xchain');
let figlet        = require('figlet')

let opts = {}

opts.serverHost          = process.env.SERVER_HOST           || 'https://xwallet.tokenly.com';
opts.serverPort          = process.env.SERVER_PORT           || 3000;
opts.xchainConnectionUrl = process.env.XCHAIN_CONNECTION_URL || "http://xchain.web01.stage01.tokenly.co";
opts.debug               = process.env.DEBUG || false;

let xchainClient = xchain.newClient(opts.xchainConnectionUrl, opts.serverHost, opts.debug)
let server = xwalletServer.run(opts.serverPort, xchainClient, opts.debug)

server.on('listening', function (e) {
    figlet.text("Tokenly XWallet", 'Slant', (err, figletText)=>{
        let sep = "---------------------------------------------------------------------------\n";
        process.stdout.write(
`${figletText}
${sep}
Running with host ${opts.serverHost} at port ${opts.serverPort}
Forwarding to XChain at ${opts.xchainConnectionUrl}\n\n`
        );
        if (opts.debug) {
            process.stdout.write(`DEBUG mode active\n`);
        }
    });
});



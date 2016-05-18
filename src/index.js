'use strict';

exports = module.exports = {};

let xwalletServer = require('./lib/xwallet/server');
let xchain = require('./lib/xwallet/xchain');

let opts = {}

opts.serverHost          = process.env.SERVER_HOST           || 'https://xwallet.tokenly.com';
opts.serverPort          = process.env.SERVER_PORT           || 3000;
opts.xchainConnectionUrl = process.env.XCHAIN_CONNECTION_URL || "http://xchain.web01.stage01.tokenly.co";

let xchainClient = xchain.newClient(opts.xchainConnectionUrl, opts.serverHost)
xwalletServer.run(opts.serverPort, xchainClient)




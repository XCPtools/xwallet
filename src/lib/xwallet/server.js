'use strict';

exports = module.exports = {};

let express = require('express');
let bodyParser = require('body-parser');
const Promise = require('promise');

const API_PREFIX = '/api/v1/';


exports.run = (serverPort, xchainClient)=> {
    // set up express
    let app = express();
    app.disable('etag');
    app.disable('x-powered-by');
    app.use(bodyParser.json());

    // route
    app.get('/', (req, res)=> {
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>XWallet API by Tokenly</title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
</head>
<body>
<div class="container" style="text-align: center; margin-top: 36px;">
<h1>XWallet API</h1>
<h4>by Tokenly</h4>
<p>&nbsp;</p>
<p>See the <a href="http://apidocs.tokenly.com/xwallet">API Docs</a>.</p>
</div>
</body>
</html>
        `);
    });

    // validate address
    app.get(API_PREFIX+'validate/:address', (req, res)=> {
        xchainClient.proxyToXchain('GET', `validate/${req.params.address}`, null, req, res);
    });

    // get asset info
    app.get(API_PREFIX+'assets/:asset', (req, res)=> {
        xchainClient.proxyToXchain('GET', `assets/${req.params.asset}`, null, req, res);
    });

    // create a new address
    app.post(API_PREFIX+'addresses', (req, res)=> {
        xchainClient.proxyToXchain('POST', 'unmanaged/addresses', req.body, req, res);
    });

    // delete an address
    app.delete(API_PREFIX+'addresses/:addressid', (req, res)=> {
        xchainClient.proxyToXchain('DELETE', `unmanaged/addresses/${req.params.addressid}`, null, req, res);
    });

    // create a new unsigned send
    app.post(API_PREFIX+'sends/:addressid', (req, res)=> {
        xchainClient.proxyToXchain('POST', `unsigned/sends/${req.params.addressid}`, req.body, req, res);
    });

    // submit a signed send transaction
    app.post(API_PREFIX+'signed/sends/:sendid', (req, res)=> {
        xchainClient.proxyToXchain('POST', `signed/sends/${req.params.sendid}`, req.body, req, res);
    });

    // delete an unsigned send transaction
    app.delete(API_PREFIX+'sends/:sendid', (req, res)=> {
        xchainClient.proxyToXchain('DELETE', `unsigned/sends/${req.params.sendid}`, req.body, req, res);
    });

    // get account balances
    app.get(API_PREFIX+'balances/:addressid', (req, res)=> {
        xchainClient.proxyToXchain('GET', `accounts/balances/${req.params.addressid}`, null, req, res);
    });



    // default 404
    app.use(function(req, res) {
        res.status(404);
        res.send(JSON.stringify({message: "This route was not found.", errorCode: "404"}));
    });

    // default 500
    app.use(function(error, req, res, next) {
        console.log('error: ', error);
        res.status(500);
        res.send(JSON.stringify({message: "Internal Server Error", errorCode: "500"}));
    });

    app.listen(serverPort, ()=>{
        console.log('server listening on port '+serverPort);
    });

    return app
}



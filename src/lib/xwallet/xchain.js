'use strict';

exports = module.exports = {};

let rest = require('restler');

const XCHAIN_API_PREFIX = '/api/v1/';


exports.newClient = (xchainConnectionUrl, serverHost, debug)=> {

    let xchainClient = {}

    /// ------------------------------------------------------------------------

    xchainClient.proxyToXchain = (method, relativePath, body, httpRequest, httpResponse, requestOptions)=> {
        let requestSpec = xchainClient.prepareRequestToXChain(method, relativePath, body, httpRequest, requestOptions);

        xchainClient.sendRequestToXChain(requestSpec.url, requestSpec.requestOptions)
            .on('complete', (data, xchainResponse)=> {
                xchainClient.sendXChainResponseToHttpResponse(data, xchainResponse, httpResponse)
            });
    }




    xchainClient.prepareRequestToXChain = (method, relativePath, body, httpRequest, requestOptions) => {
        requestOptions = requestOptions || {};
        requestOptions.headers = requestOptions.headers || {};

        requestOptions.headers['X-TOKENLY-AUTH-API-TOKEN']  = httpRequest.get('X-TOKENLY-AUTH-API-TOKEN');
        requestOptions.headers['X-TOKENLY-AUTH-NONCE']      = httpRequest.get('X-TOKENLY-AUTH-NONCE');
        requestOptions.headers['X-TOKENLY-AUTH-SIGNATURE']  = httpRequest.get('X-TOKENLY-AUTH-SIGNATURE');
        requestOptions.headers['X-TOKENLY-AUTH-SIGNED-URL'] = httpRequest.protocol+'://'+httpRequest.hostname+httpRequest.path;

        if (method == 'POST' || method == 'PUT') {
            requestOptions.headers['content-type'] = 'application/json';
            if (body) {
                requestOptions.data = JSON.stringify((typeof body === 'object' ? body : {}));
            } else {
                requestOptions.data = '{}';
            }
        }
        requestOptions.method = method;
        // console.log('requestOptions', requestOptions);

        return {
            url: xchainConnectionUrl+XCHAIN_API_PREFIX+relativePath,
            requestOptions: requestOptions
        }
    }

    xchainClient.sendRequestToXChain = (url, requestOptions) => {
        if (debug) {
            console.log(`sending request to xchain at ${url}`);
        }
        return rest.request(url, requestOptions)
    }

    xchainClient.sendXChainResponseToHttpResponse = (data, xchainResponse, httpResponse)=>{
        if (data instanceof Error) {
            console.error(data);
            httpResponse.status(500);
            httpResponse.send(JSON.stringify({message: "An internal error occurred", errorCode: "500"}));
        }

        if (debug) {
            console.log(`received response from xchain with code ${xchainResponse.statusCode}`);
        }
        httpResponse.set('content-type', xchainResponse.headers['content-type']);
        httpResponse.status(xchainResponse.statusCode);
        httpResponse.send(data);
    }


    return xchainClient;


}


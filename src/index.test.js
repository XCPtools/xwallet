'use strict';

exports = module.exports = {};

let xwalletServer = require('./lib/xwallet/server');
let xchain        = require('./lib/xwallet/xchain');
let supertest     = require('supertest');
let sinon         = require('sinon');

const EventEmitter = require('events');
const util         = require('util');

// ------------------------------------------------------------------------

function runTests() {

    let xchainClient = xchain.newClient('http://xchain.local', 'http://xwallet.local');
    let stub = sinon.stub(xchainClient, "sendRequestToXChain", buildFakeSendRequestToXChain(xchainClient));
    let app = xwalletServer.run(30001, xchainClient);


    describe('The API server', function() {
      // ----------------------------------------------

      it('should show landing page', function(done) {
        supertest(app)
          .get('/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /html/)
          .expect(/XWallet API/)
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should request asset info', function(done) {
        signRequest(setHost(
           supertest(app)
          .get('/api/v1/assets/TOKENLY')
          .set('Accept', 'application/json')
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'GET', signedUrl: 'http://xwallet.local/api/v1/assets/TOKENLY', xchainRelPath: 'assets/TOKENLY', data: null}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should validate asset', function(done) {
        signRequest(setHost(
           supertest(app)
          .get('/api/v1/validate/1TEST1111xxxxxxxxxxxxxxxxxxxtjomkj')
          .set('Accept', 'application/json')
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'GET', signedUrl: 'http://xwallet.local/api/v1/validate/1TEST1111xxxxxxxxxxxxxxxxxxxtjomkj', xchainRelPath: 'validate/1TEST1111xxxxxxxxxxxxxxxxxxxtjomkj', data: null}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should create a new address', function(done) {
        let sampleData = { 
            address: '1TEST1111xxxxxxxxxxxxxxxxxxxtjomkj',
            webhookEndpoint: 'https://mysite.com/callback'
        };

        signRequest(setHost(
           supertest(app)
          .post('/api/v1/addresses')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .send(JSON.stringify(sampleData))
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'POST', signedUrl: 'http://xwallet.local/api/v1/addresses', xchainRelPath: 'unmanaged/addresses', data: JSON.stringify(sampleData)}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should delete an address', function(done) {
        signRequest(setHost(
           supertest(app)
          .delete('/api/v1/addresses/11111111-1234-5678-1234-aaaaaaaa1111')
          .set('Accept', 'application/json')
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'DELETE', signedUrl: 'http://xwallet.local/api/v1/addresses/11111111-1234-5678-1234-aaaaaaaa1111', xchainRelPath: 'unmanaged/addresses/11111111-1234-5678-1234-aaaaaaaa1111', data: null}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should create an unsigned send transaction', function(done) {
        let sampleData = { 
            destination: '1TEST1111xxxxxxxxxxxxxxxxxxxtjomkj',
            quantity: 25,
            asset: 'TOKENLY'
        };

        signRequest(setHost(
           supertest(app)
          .post('/api/v1/sends/8baaaaaa-1234-5678-1234-aaaaaaaa1111')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .send(JSON.stringify(sampleData))
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'POST', signedUrl: 'http://xwallet.local/api/v1/sends/8baaaaaa-1234-5678-1234-aaaaaaaa1111', xchainRelPath: 'unsigned/sends/8baaaaaa-1234-5678-1234-aaaaaaaa1111', data: JSON.stringify(sampleData)}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should submit a signed send transaction', function(done) {
        let sampleData = { 
            signedTx: '0000113111deadbeef0000aaabcdef1111110000113111deadbeef'
        };

        signRequest(setHost(
           supertest(app)
          .post('/api/v1/signed/sends/8ccccccc-1234-5678-1234-cccccccc1111')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .send(JSON.stringify(sampleData))
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'POST', signedUrl: 'http://xwallet.local/api/v1/signed/sends/8ccccccc-1234-5678-1234-cccccccc1111', xchainRelPath: 'signed/sends/8ccccccc-1234-5678-1234-cccccccc1111', data: JSON.stringify(sampleData)}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should delete an unsigned send', function(done) {
        signRequest(setHost(
           supertest(app)
          .delete('/api/v1/sends/8ccccccc-1234-5678-1234-cccccccc1111')
          .set('Accept', 'application/json')
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'DELETE', signedUrl: 'http://xwallet.local/api/v1/sends/8ccccccc-1234-5678-1234-cccccccc1111', xchainRelPath: 'unsigned/sends/8ccccccc-1234-5678-1234-cccccccc1111', data: null}})
          .expect(200, done);
      });

      // ----------------------------------------------

      it('should get address balances', function(done) {
        signRequest(setHost(
           supertest(app)
          .get('/api/v1/balances/8ccccccc-1234-5678-1234-cccccccc1111')
          .set('Accept', 'application/json')
        ))
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({sent: {method: 'GET', signedUrl: 'http://xwallet.local/api/v1/balances/8ccccccc-1234-5678-1234-cccccccc1111', xchainRelPath: 'accounts/balances/8ccccccc-1234-5678-1234-cccccccc1111', data: null}})
          .expect(200, done);
      });


    });
}

// ------------------------------------------------------------------------

// pretend to sign a request
//   since xchain is mocked, it will allow it
let signRequest = function(request) {
    request.set('X-TOKENLY-AUTH-API-TOKEN', 'TESTTOKEN');
    request.set('X-TOKENLY-AUTH-NONCE',     Math.round(new Date().getTime() / 1000));
    request.set('X-TOKENLY-AUTH-SIGNATURE', 'FAKESIGNATURE');

    // console.log('request:', request);
    return request
}

let setHost = function(request) {
    request.set('Host', 'xwallet.local');
    return request
}

let buildFakeSendRequestToXChain = (xchainClient)=> {

    return function(url, requestOptions) {
        let data = {sent: {
            method: requestOptions.method,
            signedUrl: requestOptions.headers['X-TOKENLY-AUTH-SIGNED-URL'],
            xchainRelPath: url.substr(27),  // remove "http://xchain.local/api/v1/"
            data: requestOptions.data || null,
        }}

        let xchainResponse = {
            headers: {'content-type': 'application/json'},
            statusCode: 200
        }

        // trigger a 'complete' event to emulate restler
        let emitter = new EventEmitter();
        setTimeout(()=> {
            emitter.emit('complete', data, xchainResponse)
        }, 1);
        return emitter
    }
}

runTests();
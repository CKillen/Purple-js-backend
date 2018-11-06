/*
*   Primary api file
*
*
*/

// Dependencies
const https = require('https');
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Make http server
let httpServer = http.createServer(function (request, response) {
  unifiedServer(request, response)
});

// Make https server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

let httpsServer = https.createServer(httpsServerOptions, function (request, response) {
  unifiedServer(request, response)
});

httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`)
});

httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`)
});

// server logic
let unifiedServer = function (request, response) {
    // parese url then trim the path and delete hanging /
  let parsedUrl = url.parse(request.url, true);
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get query string as an object
  let queryStringObject = parsedUrl.query;

    // get method and lowercase it
  let method = request.method.toLowerCase();

    // get headers
  let headers = request.headers;

    // if payload exist grab
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  request.on('data', function (data) {
    buffer += decoder.write(data);
  });
    // This request always gets called
  request.on('end', function () {
    buffer += decoder.end();

    let choosenHandler = typeof router[trimmedPath] !== 'undefined'? router[trimmedPath] : handlers.notFound;
    let data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };
        // choose request to go to, use notFound for ones that don't exist

    choosenHandler(data, function (statusCode, payload) {
            // return given status code or default to 200
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
            // return given payload or default to empty
      payload = typeof payload === 'object' ? payload : {};
            // convert payload to string
      let payloadString = JSON.stringify(payload);
            // tell it we are returning JSON
      response.setHeader('Content-type', 'application/json');
      response.writeHead(statusCode);
      response.end(payloadString);

      console.log('returning response : ', statusCode, payloadString);
    })
  });
};


// request router
const router = {
  'backend/post': handlers.getPost,
  'ping': handlers.ping,
  'users' : handlers.users,
  'tokens' : handlers.tokens
};

"use strict";

const http = require('http');
const ipChecker = require('./geoIPCheck');
const agent = require('./agent');
const jet = http.createServer();

// proxy an HTTP request.
jet.on('request', (req, res) => {
    ipChecker(req, (tunnel) => {
        agent.http(tunnel)(req, res);
    });
});

// proxy an HTTPS request.
jet.on('connect', (req, socket, head) => {
    ipChecker(req, (tunnel) => {
        agent.https(tunnel)(req, socket, head);
    });
});
module.exports = jet;

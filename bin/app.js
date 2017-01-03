"use strict";

const socks = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');

let socksPorts = socks.createServer();
let httpPorts = mhttp.createServer(socksPorts);
let pacServer = pac.createServer(httpPorts);



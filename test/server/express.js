"use strict";

var express = require('express');
var http = require('http');
var path = require('path');

function Express() { }

Express.prototype.start = function(done) {
  this.app = express();
  this.app.use(express["static"](path.resolve(__dirname + '/static')));
  this.server = http.createServer(this.app);
  this.server.listen(process.env.EXPRESS_PORT || 8181, done);
};

Express.prototype.stop = function(done) {
  this.server.close(done);
};

module.exports = {
  Express: Express
};


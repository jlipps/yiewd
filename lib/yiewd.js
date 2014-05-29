"use strict";
var wd = require("wd")
  , Q = wd.Q
  , monocle = require("monocle-js")
  , SauceLabs = require('saucelabs')
  , apsc = function(obj) { return Array.prototype.slice.call(obj, 0); };

var yiewd = module.exports = {};

wd.addPromiseChainMethod('reportStatus', function(passed) {
  if (this._yiewd_sauce === null) {
    throw new Error("Status reporting is for Sauce Labs tests");
  }
  return Q.nfcall( this._yiewd_sauce.updateJob.bind(this._yiewd_sauce),
    this.sessionID , {passed: passed});
});

wd.addPromiseChainMethod('reportPass', function() {
  return this.reportStatus(true);
});

wd.addPromiseChainMethod('reportFail', function() {
  return this.reportStatus(false);
});

wd.addPromiseChainMethod('sauceInfo', function() {
  if (this._yiewd_sauce === null) {
    throw new Error("Showing job info is for Sauce Labs tests");
  }
  return Q.nfcall(
    this._yiewd_sauce.showJob.bind(this._yiewd_sauce), this.sessionID);
});

yiewd.remote = function() {
  var args = apsc(arguments);
  var d = wd.promiseChainRemote.apply(wd, args);
  d.defaultChainingScope = 'element';
  d.run = function(gen) { return monocle.run(gen, d); };
  return d;
};

var _setSauceCreds = function(driver, userName, accessKey, host) {
  driver._yiewd_sauce = new SauceLabs({
    username: userName
    , password: accessKey
    , hostname: host
  });
};

yiewd.sauce = function(userName, accessKey, server, port) {
  var apiHostname = 'saucelabs.com';
  if (typeof server === "undefined") {
    server = 'ondemand.saucelabs.com';
  } else if (server !== 'ondemand.saucelabs.com') {
    apiHostname = server;
  }
  if (typeof port === "undefined") {
    port = 80;
  }
  var d = yiewd.remote(server, port, userName, accessKey);
  _setSauceCreds(d, userName, accessKey, apiHostname);
  return d;
};

yiewd.TouchAction = wd.TouchAction;
yiewd.MultiAction = wd.MultiAction;
yiewd.SPECIAL_KEYS = wd.SPECIAL_KEYS;

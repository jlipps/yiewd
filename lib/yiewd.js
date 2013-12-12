"use strict";
var wd = require("wd")
  , _ = require("underscore")
  , monocle = require("monocle-js")
  , o_O = monocle.o_O
  , o_C = monocle.callback
  , o_P = monocle.o_P
  , run = monocle.run
  , Element = require('./yiewd-element')
  , wdUtils = wd.utils
  , SauceLabs = require('saucelabs')
  , apsc = function(obj) { return Array.prototype.slice.call(obj, 0); };

var yiewd = module.exports = {};

yiewd.remote = function() {
  var args = apsc(arguments);
  var d = new Driver();
  d._setInnerDriver(wd.remote.apply(wd, args));
  return d;
};

yiewd.sauce = function(userName, accessKey, server, port) {
  var apiHostname = 'saucelabs.com';
  if (typeof server === "undefined") {
    server = 'ondemand.saucelabs.com';
  } else {
    apiHostname = server;
  }
  if (typeof port === "undefined") {
    port = 80;
  }
  var d = yiewd.remote(server, port, userName, accessKey);
  d._setSauceCreds(userName, accessKey, apiHostname);
  return d;
};

var Driver = function() {
  this.driver = null;
  this.sauce = null;
};

Driver.prototype._setInnerDriver = function(driver) {
  this.driver = driver;
  var methods = this.getDriverMethods();

  _.each(methods, function(asyncMethod) {
    this[asyncMethod] = this.wrapAsyncMethod(this.driver, asyncMethod);
  }.bind(this));

  _.each(methods, function(asyncMethod) {
    this[asyncMethod] = this.wrapAsyncMethod(this.driver, asyncMethod);
  }.bind(this));

  _.each(this.getDriverSyncMethods(), function(method) {
    this[method] = function() {
      var args = apsc(arguments);
      return this.driver[method].apply(this.driver, args);
    }.bind(this);
  }.bind(this));
};

Driver.prototype._setSauceCreds = function(userName, accessKey, host) {
  this.sauce = new SauceLabs({
    username: userName
    , password: accessKey
    , hostname: host
  });
};

Driver.prototype.wrapAsyncMethod = function(wrappedObj, asyncMethod) {
  var self = this;
  return o_P(function*() {
    var args = self.unwrapAnyElements(apsc(arguments));
    var cb = o_C();
    args.push(cb);
    wrappedObj[asyncMethod].apply(wrappedObj, args);
    return self.wrapAnyElements(yield cb);
  });
};

Driver.prototype.wrapAnyElements = function(responseObjs) {
  var i;
  var wasArray = true;
  if (typeof responseObjs === "undefined" || responseObjs === null) {
    return responseObjs;
  }
  if (typeof responseObjs !== 'object' || !_.has(responseObjs, 'length')) {
    responseObjs = [responseObjs];
    wasArray = false;
  }
  for (i = 0; i < responseObjs.length; i++) {
    if (typeof responseObjs[i] === "object" &&
        responseObjs[i] !== null &&
        typeof responseObjs[i].value !== "undefined" &&
        typeof responseObjs[i].browser !== "undefined") {
      var el = new Element();
      el._setInnerElement(responseObjs[i], this.wrapAsyncMethod.bind(this));
      responseObjs[i] = el;
    }
  }
  if (responseObjs.length === 1 && !wasArray) {
    return responseObjs[0];
  } else {
    return responseObjs;
  }
};

Driver.prototype.unwrapAnyElements = function(args) {
  var i;
  for (i = 0; i < args.length; i++) {
    if (typeof args[i] === "object" && args[i] !== null &&
        args[i]._is_yiewd_el === true) {
      args[i] = args[i]._element;
    }
  }
  return args;
};

Driver.prototype.reportStatus = o_O(function*(passed) {
  if (this.sauce === null) {
    throw new Error("Status reporting is for Sauce Labs tests");
  }
  var cb = o_C();
  this.sauce.updateJob(this.driver.sessionID, {passed: passed}, cb);
  return (yield cb);
});

Driver.prototype.reportPass = o_O(function*() {
  return (yield this.reportStatus(true));
});

Driver.prototype.reportFail = o_O(function*() {
  return (yield this.reportStatus(false));
});

Driver.prototype.sauceInfo = o_O(function*() {
  if (this.sauce === null) {
    throw new Error("Showing job info is for Sauce Labs tests");
  }
  var cb = o_C();
  this.sauce.showJob(this.driver.sessionID, cb);
  return (yield cb);
});

Driver.prototype.sleep = monocle.utils.sleep;

Driver.prototype.run = function(gen) {
  return run(gen, this);
};

Driver.prototype.getDriverMethods = function() {
  var methods = [
    'init'
    , 'quit'
    , 'status'
    , 'sessions'
    , 'sessionCapabilities'
    , 'newWindow'
    , 'window'
    , 'windowName'
    , 'windowHandles'
    , 'windowHandle'
    , 'get'
    , 'title'

    // not yet tested
    , 'close'
    , 'frame'
    , 'eval'
    , 'safeEval'
    , 'execute'
    , 'safeExecute'
    , 'executeAsync'
    , 'safeExecuteAsync'
    , 'refresh'
    , 'maximize'
    , 'windowSize'
    , 'getWindowSize'
    , 'setWindowSize'
    , 'getWindowPosition'
    , 'setWindowPosition'
    , 'forward'
    , 'back'
    , 'setImplicitWaitTimeout'
    , 'setAsyncScriptTimeout'
    , 'setPageLoadTimeout'
    , 'element'
    , 'elementOrNull'
    , 'elementIfExists'
    , 'elements'
    , 'hasElement'
    , 'waitForElement'
    , 'waitForVisible'
    , 'takeScreenshot'
    , 'getTagName'
    , 'flick'
    , 'buttonDown'
    , 'buttonUp'
    , 'moveTo'
    , 'click'
    , 'doubleclick'
    , 'type'
    , 'keys'
    , 'source'
    , 'alertText'
    , 'alertKeys'
    , 'acceptAlert'
    , 'dismissAlert'
    , 'active'
    , 'url'
    , 'allCookies'
    , 'setCookie'
    , 'deleteAllCookies'
    , 'deleteCookie'
    , 'getOrientation'
    , 'setOrientation'
    , 'setLocalStorageKey'
    , 'getLocalStorageKey'
    , 'removeLocalStorageKey'
    , 'clearLocalStorage'
    , 'uploadFile'
    , 'waitForConditionInBrowser'
  ];
  _.each(wdUtils.elementFuncTypes, function(type) {
    methods.push("element" + wdUtils.elFuncSuffix(type));
    methods.push("element" + wdUtils.elFuncSuffix(type) + "OrNull");
    methods.push("element" + wdUtils.elFuncSuffix(type) + "IfExists");
    methods.push("hasElement" + wdUtils.elFuncSuffix(type));
    methods.push("waitForElement" + wdUtils.elFuncSuffix(type));
    methods.push("waitForVisible" + wdUtils.elFuncSuffix(type));
    methods.push("elements" + wdUtils.elFuncSuffix(type));
  });
  return methods;
};

Driver.prototype.getDriverSyncMethods = function() {
  return [
    // not yet tested
    'setHTTPInactivityTimeout'
  ];
};

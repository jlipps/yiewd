"use strict";
var wd = require("wd")
  , _ = require("underscore")
  , apsc = function(obj) { return Array.prototype.slice.call(obj, 0); };

var yiewd = module.exports = {};

yiewd.remote = function() {
  var args = apsc(arguments);
  var gen = args.pop();
  var d = new Driver(gen);
  d._setInnerDriver(wd.remote.apply(wd, args));
};

var Driver = function(generator) {
  this.driver = null;
  this.generator = generator;
  this.iterator = null;
};

Driver.prototype._setInnerDriver = function(driver) {
  this.driver = driver;
  this.iterator = this.generator(this);

  var cbMethods = [
    'init'
    , 'quit'
  ];

  _.each(cbMethods, function(cbMethod) {
    this[cbMethod] = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      var cb = function() {
        var innerArgs = Array.prototype.slice.call(arguments, 0);
        var res;
        if (innerArgs.length === 0) {
          var err = new Error("Didn't get node-style cb");
          this.iterator.throw(err);
          return;
        } else if (innerArgs.length === 1 && innerArgs[0] !== null) {
          this.iterator.throw(innerArgs[0]);
          return;
        } else if (innerArgs.length === 2) {
          res = innerArgs[1];
        } else {
          res = innerArgs;
        }
        this.iterator.next(res);
      }.bind(this);
      args.push(cb);
      this.driver[cbMethod].apply(this.driver, args);
    }.bind(this);
  }.bind(this));

  this.iterator.next();
};

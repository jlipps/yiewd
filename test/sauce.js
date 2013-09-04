/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../lib/yiewd.js')
  , _ = require('underscore')
  , should = require('should')
  , SauceLabs = require('saucelabs')
  , baseUrl = 'http://saucelabs.com/test/guinea-pig/'
  , userName = process.env.SAUCE_USERNAME
  , accessKey = process.env.SAUCE_ACCESS_KEY
  , run = require("monocle-js").run
  , caps = {
      platform: 'Linux'
      , browserName: 'chrome'
      , name: 'Yiewd test'
    };

describe('yiewd sauce support', function() {
  // handle running test server
  var driver = null;
  var sauce = new SauceLabs({
    username: userName
    , password: accessKey
  });
  it('should only work for sauce tests', function(done) {
    driver = yiewd.remote();
    run(function*(d) {
      yield driver.init({browserName: 'chrome'});
      var err = null;
      try {
        yield driver.reportPass();
      } catch (e) {
        err = e;
      }
      yield driver.quit();
      should.exist(err);
      should.exist(err.message);
      done();
    });
  });

  it('should run a job on sauce', function(done) {
    yiewd.sauce(userName, accessKey).run(function*() {
      yield this.init(caps);
      yield this.get(baseUrl);
      (yield this.title()).should.include("I am a page title");
      yield this.quit();
      done();
    });
  });

  it('should set passed status', function(done) {
    yiewd.sauce(userName, accessKey).run(function*() {
      var sessId = yield this.init(caps);
      yield this.get(baseUrl);
      (yield this.title()).should.include("I am a page title");
      yield this.reportPass();
      yield this.quit();
      sauce.showJob(sessId, function(err, res) {
        should.not.exist(err);
        res.passed.should.equal(true);
        done();
      });
    });
  });

  it('should set failed status', function(done) {
    yiewd.sauce(userName, accessKey).run(function*() {
      var sessId = yield this.init(caps);
      yield this.get(baseUrl);
      (yield this.title()).should.include("I am a page title");
      yield this.reportFail();
      yield this.quit();
      sauce.showJob(sessId, function(err, res) {
        should.not.exist(err);
        res.passed.should.equal(false);
        done();
      });
    });
  });

});


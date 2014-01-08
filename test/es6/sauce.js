/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../../lib/main.js')
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

require('colors');

describe('yiewd sauce support', function() {
  // handle running test server
  var sauce = new SauceLabs({
    username: userName
    , password: accessKey
  });

  it('should only work for sauce tests', function(done) {
    var driver = yiewd.remote();
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
  
  describe('on sauce', function() {
    var browser;

    before(function() {
      browser = yiewd.sauce(userName, accessKey);
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
    });

    it('should run a job on sauce', function(done) {
      browser.run(function*() {
        yield this.init(caps);
        yield this.get(baseUrl);
        (yield this.title()).should.include("I am a page title");
        yield this.quit();
        done();
      });
    });

    it('should set passed status', function(done) {
      browser.run(function*() {
        var sessId = yield this.init(caps);
        yield this.get(baseUrl);
        (yield this.title()).should.include("I am a page title");
        yield this.reportPass();
        yield this.quit();
        var jobInfo = yield this.sauceInfo();
        jobInfo.passed.should.equal(true);
        done();
      });
    });

    it('should set failed status', function(done) {
      browser.run(function*() {
        var sessId = yield this.init(caps);
        yield this.get(baseUrl);
        (yield this.title()).should.include("I am a page title");
        yield this.reportFail();
        yield this.quit();
        var jobInfo = yield this.sauceInfo();
        jobInfo.passed.should.equal(false);
        done();
      });
    });
  });

});


/*global describe:true, it:true, before:true */
"use strict";

var yiewd = require('../../lib/main.js')
  , should = require('should')
  , baseUrl = 'http://saucelabs.com/test/guinea-pig/'
  , userName = process.env.SAUCE_USERNAME
  , accessKey = process.env.SAUCE_ACCESS_KEY
  , mo_Ocha = require("mo_ocha")
  , caps = {
      platform: 'Linux'
      , browserName: 'chrome'
      , name: 'Yiewd test'
    };

require('colors');
mo_Ocha.rewrite();

describe('yiewd sauce support', function() {

  it('should only work for sauce tests', function*() {
    var driver = yiewd.remote();
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
  });

  describe('on sauce', function() {
    var driver;

    before(function() {
      driver = yiewd.sauce(userName, accessKey);
      driver.on('status', function(info) {
        console.log(info.cyan);
      });
      driver.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
    });

    it('should run a job on sauce', function*() {
      yield driver.init(caps);
      yield driver.get(baseUrl);
      (yield driver.title()).should.include("I am a page title");
      yield driver.quit();
    });

    it('should set passed status', function*() {
      yield driver.init(caps);
      yield driver.get(baseUrl);
      (yield driver.title()).should.include("I am a page title");
      yield driver.reportPass();
      yield driver.quit();
      var jobInfo = yield driver.sauceInfo();
      jobInfo.passed.should.equal(true);
    });

    it('should set failed status', function*() {
      yield driver.init(caps);
      yield driver.get(baseUrl);
      (yield driver.title()).should.include("I am a page title");
      yield driver.reportFail();
      yield driver.quit();
      var jobInfo = yield driver.sauceInfo();
      jobInfo.passed.should.equal(false);
    });
  });

});


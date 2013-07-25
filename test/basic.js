/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../lib/yiewd.js')
  , Express = require('../node_modules/wd/test/common/express.js').Express
  , should = require('should');

describe('basic functionality', function() {

  // handle running test server
  var server = new Express();
  var driver = null;
  var caps = { browserName: 'chrome' };
  before(function(done) {
    server.start();
    done();
  });
  after(function(done) {
    server.stop();
    done();
  });

  it('should start a session', function(done) {
    yiewd.remote(function*(d) {
      driver = d;
      yield driver.init(caps);
      done();
    });
  });

  it('should get session status', function(done) {
    driver.run(function*() {
      var status = yield driver.status();
      should.exist(status.build);
      done();
    });
  });

  it('should stop a session', function(done) {
    driver.run(function*() {
      yield driver.quit();
      done();
    });
  });
});

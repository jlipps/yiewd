/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../lib/yiewd.js')
  , Express = require('../node_modules/wd/test/common/express.js').Express;

describe('basic functionality', function() {

  // handle running test server
  var server = new Express();
  before(function(done) {
    server.start();
    done();
  });
  after(function(done) {
    server.stop();
    done();
  });

  it('should start and stop a session', function(done) {
    var caps = { browserName: 'chrome' };
    yiewd.remote(function*(driver) {
      yield driver.init(caps);
      (yield driver.quit());
      done();
    });
  });
});

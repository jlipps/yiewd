/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../lib/yiewd.js')
  , Express = require('../node_modules/wd/test/common/express.js').Express
  , _ = require('underscore')
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/'
  , monocle = require("monocle")
  , o0 = monocle.o0
  , oR = monocle.Return
  , run = monocle.run
  , caps = { browserName: 'chrome' };

describe('yiewd', function() {
  // handle running test server
  var server = new Express();
  var driver = null;
  var handles = [];
  before(function(done) {
    server.start();
    done();
  });
  after(function(done) {
    server.stop();
    done();
  });

  it('should start a session', function(done) {
    run(function*() {
      var d = yiewd.remote();
      driver = d;
      yield driver.init(caps);
      done();
    });
  });

  it('should get session status', function(done) {
    run(function*() {
      var status = yield driver.status();
      should.exist(status.build);
      done();
    });
  });

  it('should get list of sessions', function(done) {
    run(function*() {
      var sessions = yield driver.sessions();
      sessions.length.should.be.above(0);
      should.exist(sessions[0].id);
      done();
    });
  });

  it('should get session caps', function(done) {
    run(function*() {
      var sessionCaps = yield driver.sessionCapabilities();
      should.exist(sessionCaps.browserName);
      sessionCaps.browserName.should.equal('chrome');
      done();
    });
  });

  it('should get a url, page title, and window handle', function(done) {
    run(function*() {
      var testPage = baseUrl + 'test-page.html';
      yield driver.get(testPage);
      var title = yield driver.title();
      title.should.equal("TEST PAGE");
      var handle = yield driver.windowHandle();
      handle.length.should.be.above(0);
      handles['window-1'] = handle;
      done();
    });
  });

  it('should open a new window', function(done) {
    var newWindow = baseUrl + 'window-test-page.html?window_num=2';
    run(function*() {
      yield driver.newWindow(newWindow, 'window-2');
      done();
    });
  });

  it('should switch to a window', function(done) {
    run(function*() {
      yield driver.window("window-2");
      done();
    });
  });

  it('should get the window name', function(done) {
    run(function*() {
      var name = yield driver.windowName();
      name.should.equal("window-2");
      var handle = yield driver.windowHandle();
      handle.length.should.be.above(0);
      handle.should.not.eql(handles['window-1']);
      handles['window-2'] = handle;
      done();
    });
  });

  it('should get window handles', function(done) {
    run(function*() {
      var wdHandles = yield driver.windowHandles();
      _.each(handles, function(handle, handleId) {
        wdHandles.should.include(handle);
      });
      done();
    });
  });

  it('should sleep', function(done) {
    run(function*() {
      var begin = Date.now();
      yield driver.sleep(0.5);
      var end = Date.now();
      (end - begin).should.be.above(499);
      done();
    });
  });

  it('driver.run should bind methods to `this`', function(done) {
    driver.run(function*() {
      var title = yield this.title();
      title.should.equal('Test Page');
      done();
    });
  });

  it('should stop a session', function(done) {
    run(function*() {
      yield driver.quit();
      done();
    });
  });

  it('should work passing in host and port', function(done) {
    run(function*() {
      var d = yiewd.remote('localhost', 4444);
      yield d.init(caps);
      yield d.quit();
      done();
    });
  });

});

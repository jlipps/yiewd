/*global describe:true, it:true, before:true, after:true */
"use strict";

var _ = require('underscore');
var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , monocle = require("monocle-js")
  , o0 = monocle.o0
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
    if (driver !== null) {
      driver.run(function*() {
        yield this.quit();
        done();
      });
    } else {
      done();
    }
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
      var testPage = baseUrl + 'guinea-pig.html';
      yield driver.get(testPage);
      var title = yield driver.title();
      title.should.equal("I am a page title");
      var handle = yield driver.windowHandle();
      handle.length.should.be.above(0);
      handles['window-1'] = handle;
      done();
    });
  });

  it('should open a new window', function(done) {
    var newWindow = baseUrl + 'guinea-pig2.html';
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

  it('should handle wd errors', function(done) {
    driver.run(function*() {
      var err;
      try {
        yield this.alertText();
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.message.should.include('27');
      done();
    });
  });

  it('should handle wd errors asynchronously', function(done) {
    driver.run(function*() {
      try {
        yield this.alertText();
      } catch (e) {
        throw e;
      }
    }).nodeify(function (err) {
      should.exist(err);
      err.message.should.include('27');
      done();
    });
  });

  it('should sleep', function(done) {
    run(function*() {
      var begin = Date.now();
      yield driver.sleep(500);
      var end = Date.now();
      (end - begin).should.be.above(499);
      done();
    });
  });

  it('should be able to compose methods', function(done) {
    var title = '';
    var start = Date.now();
    var myFunc = o0(function*() {
      title += yield driver.title();
      yield driver.sleep(250);
    });
    var myFunc2 = o0(function*() {
      title += ' foo ';
    });
    run(function*() {
      yield myFunc();
      yield myFunc2();
      yield myFunc();
      (Date.now() - start).should.be.above(499);
      done();
    });
  });

  it('driver.run should bind methods to `this`', function(done) {
    driver.run(function*() {
      var title = yield this.title();
      title.should.equal('I am another page title');
      done();
    });
  });

  it('should stop a session', function(done) {
    run(function*() {
      yield driver.quit();
      driver = null;
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

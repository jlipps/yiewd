/*global describe:true, it:true, before:true, after:true */
"use strict";

var _ = require('underscore');
var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , native = require('../../lib/detect-harmony.js').generators
  , co = require("co")
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
      driver.co(function*() {
        yield this.quit();
      })(done);
    } else {
      done();
    }
  });

  it('should start a session', function(done) {
    co(function*() {
      var d = yiewd.remote();
      driver = d;
      yield driver.init(caps);
    })(done);
  });

  it('should get session status', function(done) {
    co(function*() {
      var status = yield driver.status();
      should.exist(status.build);
    })(done);
  });

  it('should get list of sessions', function(done) {
    co(function*() {
      var sessions = yield driver.sessions();
      sessions.length.should.be.above(0);
      should.exist(sessions[0].id);
    })(done);
  });

  it('should get session caps', function(done) {
    co(function*() {
      var sessionCaps = yield driver.sessionCapabilities();
      should.exist(sessionCaps.browserName);
      sessionCaps.browserName.should.equal('chrome');
    })(done);
  });

  it('should get a url, page title, and window handle', function(done) {
    co(function*() {
      var testPage = baseUrl + 'guinea-pig.html';
      yield driver.get(testPage);
      var title = yield driver.title();
      title.should.equal("I am a page title");
      var handle = yield driver.windowHandle();
      handle.length.should.be.above(0);
      handles['window-1'] = handle;
    })(done);
  });

  it('should open a new window', function(done) {
    var newWindow = baseUrl + 'guinea-pig2.html';
    co(function*() {
      yield driver.newWindow(newWindow, 'window-2');
    })(done);
  });

  it('should switch to a window', function(done) {
    co(function*() {
      yield driver.window("window-2");
    })(done);
  });

  it('should get the window name', function(done) {
    co(function*() {
      var name = yield driver.windowName();
      name.should.equal("window-2");
      var handle = yield driver.windowHandle();
      handle.length.should.be.above(0);
      handle.should.not.eql(handles['window-1']);
      handles['window-2'] = handle;
    })(done);
  });

  it('should get window handles', function(done) {
    co(function*() {
      var wdHandles = yield driver.windowHandles();
      _.each(handles, function(handle) {
        wdHandles.should.include(handle);
      });
    })(done);
  });

  it('should handle wd errors', function(done) {
    co(function*() {
      var err;
      try {
        console.log(1);
        yield driver.alertText();
        console.log(2);
      } catch(e) {
        console.log(3);
        err = e;
      }
      console.log(err);
      should.exist(err);
      err.message.should.include('27');
    })(done);
  });

  it('should handle wd errors asynchronously', function(done) {
    co(function*() {
      try {
        yield driver.alertText();
      } catch (e) {
        throw e;
      }
    })(function (err) {
      should.exist(err);
      err.message.should.include('27');
      done();
    });
  });

  it('should sleep', function(done) {
    co(function*() {
      var begin = Date.now();
      yield driver.sleep(500);
      var end = Date.now();
      (end - begin).should.be.above(499);
    })(done);
  });

  it('should be able to compose methods', function(done) {
    var title = '';
    var start = Date.now();
    var myFunc = function*() {
      title += yield driver.title();
      yield driver.sleep(250);
    };
    var myFunc2 = function*() {
      title += ' foo ';
      yield driver.sleep(1);
    };
    co(function*() {
      yield myFunc();
      yield myFunc2();
      yield myFunc();
      (Date.now() - start).should.be.above(499);
    })(done);
  });

  if (native) {
    it('driver.co should bind methods to `this`', function(done) {
      driver.co(function*() {
        var title = yield this.title();
        title.should.equal('I am another page title');
      })(done);
    });
  }

  it('should stop a session', function(done) {
    co(function*() {
      yield driver.quit();
      driver = null;
    })(done);
  });

  it('should work passing in host and port', function(done) {
    co(function*() {
      var d = yiewd.remote('localhost', 4444);
      yield d.init(caps);
      yield d.quit();
    })(done);
  });

});

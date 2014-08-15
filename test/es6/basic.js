/*global describe:true, it:true, before:true, after:true */
"use strict";

var _ = require('underscore');
var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , mo_Ocha = require("mo_ocha")
  , monocle = require("monocle-js")
  , o0 = monocle.o0
  , caps = { browserName: 'chrome' };

var origIt = GLOBAL.it;
mo_Ocha.rewrite();

describe('yiewd', function() {
  // handle running test server
  var server = new Express();
  var driver = null;
  var handles = [];
  before(function() {
    server.start();
  });

  after(function*() {
    server.stop();
    if (driver !== null) {
      yield driver.quit();
    }
  });

  it('should start a session', function*() {
    var d = yiewd.remote();
    driver = d;
    yield driver.init(caps);
  });

  it('should get session status', function*() {
    var status = yield driver.status();
    should.exist(status.build);
  });

  it('should get list of sessions', function*() {
    var sessions = yield driver.sessions();
    sessions.length.should.be.above(0);
    should.exist(sessions[0].id);
  });

  it('should get session caps', function*() {
    var sessionCaps = yield driver.sessionCapabilities();
    should.exist(sessionCaps.browserName);
    sessionCaps.browserName.should.equal('chrome');
  });

  it('should get a url, page title, and window handle', function*() {
    var testPage = baseUrl + 'guinea-pig.html';
    yield driver.get(testPage);
    var title = yield driver.title();
    title.should.equal("I am a page title");
    var handle = yield driver.windowHandle();
    handle.length.should.be.above(0);
    handles['window-1'] = handle;
  });

  it('should open a new window', function*() {
    var newWindow = baseUrl + 'guinea-pig2.html';
    yield driver.newWindow(newWindow, 'window-2');
  });

  it('should switch to a window', function*() {
    yield driver.window("window-2");
  });

  it('should get the window name', function*() {
    var name = yield driver.windowName();
    name.should.equal("window-2");
    var handle = yield driver.windowHandle();
    handle.length.should.be.above(0);
    handle.should.not.eql(handles['window-1']);
    handles['window-2'] = handle;
  });

  it('should get window handles', function*() {
    var wdHandles = yield driver.windowHandles();
    _.each(handles, function(handle) {
      wdHandles.should.include(handle);
    });
  });

  it('should handle wd errors', function*() {
    var err;
    try {
      yield driver.alertText();
    } catch(e) {
      err = e;
    }
    should.exist(err);
    err.message.should.include('27');
  });

  origIt('should handle wd errors asynchronously', function(done) {
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

  it('should sleep', function*() {
    var begin = Date.now();
    yield driver.sleep(500);
    var end = Date.now();
    (end - begin).should.be.above(499);
  });

  it('should be able to compose methods', function*() {
    var title = '';
    var start = Date.now();
    var myFunc = o0(function*() {
      title += yield driver.title();
      yield driver.sleep(250);
    });
    var myFunc2 = o0(function*() {
      title += ' foo ';
    });
    yield myFunc();
    yield myFunc2();
    yield myFunc();
    (Date.now() - start).should.be.above(499);
  });

  origIt('driver.run should bind methods to `this`', function(done) {
    driver.run(function*() {
      var title = yield this.title();
      title.should.equal('I am another page title');
      done();
    });
  });

  it('should stop a session', function*() {
    yield driver.quit();
    driver = null;
  });

  it('should work passing in host and port', function*() {
    var d = yiewd.remote('localhost', 4444);
    yield d.init(caps);
    yield d.quit();
  });

});

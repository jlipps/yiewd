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

describe('yiewd elements', function() {
  // handle running test server
  var server = new Express();
  var driver = null;
  var handles = [];
  before(function(done) {
    server.start();
    run(function*() {
      driver = yiewd.remote();
      yield driver.init(caps);
      done();
    });
  });
  after(function(done) {
    run(function*() {
      yield driver.quit();
      done();
    });
  });

  it('should click and get text', function(done) {
    run(function*() {
      yield driver.get(baseUrl + "element-test-page.html");
      var anchor = yield driver.elementByCss("#click a");
      yield driver.execute("jQuery(function() {\n" +
        "var a = $('#click a');\n" +
        "a.click(function() {\n" +
          "a.html('clicked');\n" +
          "return false;\n" +
        "});\n" +
      "});");
      var text = yield anchor.text();
      (yield anchor.text()).should.equal("not clicked");
      yield anchor.click();
      (yield anchor.text()).should.equal("clicked");
      done();
    });
  });

});


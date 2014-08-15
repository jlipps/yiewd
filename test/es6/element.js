/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , mo_Ocha = require("mo_ocha")
  , caps = { browserName: 'chrome' };

var origIt = GLOBAL.it;
mo_Ocha.rewrite();

describe('yiewd elements', function() {
  // handle running test server
  var server = new Express();
  var driver = null;
  before(function*() {
    server.start();
    driver = yiewd.remote();
    yield driver.init(caps);
  });
  after(function*() {
    yield driver.quit();
  });

  it('should click and get text', function*() {
    yield driver.get(baseUrl + "guinea-pig.html");
    var anchor = yield driver.elementByLinkText("i am a link");
    (yield anchor.text()).should.equal("i am a link");
    yield anchor.click();
    (yield driver.title()).should.equal("I am another page title");
  });

  it('should work getting els from els', function*() {
    yield driver.back();
    var div = yield driver.elementById('the_forms_id');
    var anchor = yield div.elementByTagName('p');
    var input = yield anchor.elementByTagName('input');
    var text = yield input.getAttribute('value');
    text.should.equal("i has no focus");
  });

  origIt('should fail when an element is not there', function(done) {
    driver.run(function*() {
      var e;
      try {
        yield driver.elementById('donotexistman');
      } catch (err) {
        e = err;
      }
      e.message.should.include("7");
      yield driver.elementByTagName("nowaydude");
    }).nodeify(function(err) {
      should.exist(err);
      err.message.should.include("NoSuchElement");
      done();
    });
  });

  it('should defer findElement if requested', function*() {
    yield driver.get(baseUrl + "guinea-pig.html");
    yield driver.elementByLinkText("i am a link").click();
    (yield driver.title()).should.equal("I am another page title");
    yield driver.back();
    var text = yield driver.elementByTagName('body').elementById('the_forms_id')
      .elementByTagName('input').getValue();
    text.should.equal("i has no focus");
  });

});


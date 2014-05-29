/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , monocle = require('monocle-js')
  , run = monocle.run
  , caps = { browserName: 'chrome' };

describe('yiewd elements', function() {
  // handle running test server
  var server = new Express();
  var driver = null;
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
      yield driver.get(baseUrl + "guinea-pig.html");
      var anchor = yield driver.elementByLinkText("i am a link");
      (yield anchor.text()).should.equal("i am a link");
      yield anchor.click();
      (yield driver.title()).should.equal("I am another page title");
      done();
    });
  });

  it('should work getting els from els', function(done) {
    run(function*() {
      yield driver.back();
      var div = yield driver.elementById('the_forms_id');
      var anchor = yield div.elementByTagName('p');
      var input = yield anchor.elementByTagName('input');
      var text = yield input.getAttribute('value');
      text.should.equal("i has no focus");
      done();
    });
  });

  it('should fail when an element is not there', function(done) {
    run(function*() {
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

  it('should defer findElement if requested', function(done) {
    run(function*() {
      yield driver.get(baseUrl + "guinea-pig.html");
      yield driver.elementByLinkText("i am a link").click();
      (yield driver.title()).should.equal("I am another page title");
      yield driver.back();
      var text = yield driver.elementByTagName('body').elementById('the_forms_id')
        .elementByTagName('input').getValue();
      text.should.equal("i has no focus");
      done();
    });
  });

});


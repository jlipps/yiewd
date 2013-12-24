/*global describe:true, it:true, before:true, after:true */
"use strict";

var yiewd = require('../../lib/main.js')
  , Express = require('../server/express.js').Express
  , _ = require('underscore')
  , should = require('should')
  , baseUrl = 'http://127.0.0.1:8181/test/'
  , monocle = require('monocle-js')
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
      yield driver.get(baseUrl + "guinea-pig.html");
      var anchor = yield driver.elementByLinkText("i am a link");
      var text = yield anchor.text();
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

  if (monocle.native) {
    it('should defer findElement if requested', function(done) {
      run(function*() {
        yield driver.elementByLinkText("i am a link").click();
        (yield driver.title()).should.equal("I am another page title");
        yield driver.back();
        (yield driver.elementByTagName('body').elementsById('the_forms_id')[0].elementByTagName('p').elementByTagName('input').getAttribute('value')).should.equal("i has no focus");
        done();
      });
    });
  }

});


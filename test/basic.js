/*global describe:true it:true*/
"use strict";

var yiewd = require('../lib/yiewd.js');

describe('basic functionality', function() {
  it('should start and stop sessions', function(done) {
    var caps = { browserName: 'chrome' };
    yiewd.remote(function*(driver) {
      yield driver.init(caps);
      yield driver.quit();
      done();
    });
  });
});

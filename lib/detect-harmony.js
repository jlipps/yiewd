/*jshint evil:true */
"use strict";

var features = {
  generators: false
};

try {
  // detect es6 functionality
  eval("(function*() { yield 1 })()");
  features.generators = true;
} catch (e) {
  // otherwise use es5 and regenerator
}

module.exports = features;


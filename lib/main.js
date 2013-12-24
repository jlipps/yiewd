"use strict";

require('wd');
var monocle = require('monocle-js');

if (monocle.native) {
  module.exports = require('./yiewd.js');
} else {
  module.exports = require('./es5/yiewd.js');
}

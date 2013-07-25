"use strict";

var _ = require('underscore');

var Element = module.exports = function() {
  this.element = null;
  this._is_yiewd_el = true;
};

Element.prototype._setInnerElement = function(element, decorator) {
  this.element = element;

  _.each(this._getElementMethods(), function(asyncMethod) {
    this[asyncMethod] = decorator(this.element, asyncMethod);
  }.bind(this));
};

Element.prototype._getElementMethods = function() {
  return [
    'click'
    , 'text'
  ];
};

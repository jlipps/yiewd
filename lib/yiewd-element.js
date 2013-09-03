"use strict";

var _ = require('underscore')
  , wdUtils = require("wd").utils;

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
  var methods = [
    'click'
    , 'text'

    // not yet tested
    , 'type'
    , 'sendKeys'
    , 'doubleclick'
    , 'doubleClick'
    , 'flick'
    , 'textPresent'
    , 'getAttribute'
    , 'getTagName'
    , 'isDisplayed'
    , 'displayed'
    , 'isSelected'
    , 'selected'
    , 'isEnabled'
    , 'enabled'
    , 'isVisible'
    , 'visible'
    , 'getLocation'
    , 'getSize'
    , 'getValue'
    , 'getComputedCss'
    , 'getComputedCSS'
    , 'clear'
    , 'submit'
    , 'element'
    , 'elements'
    , 'equals'
  ];
  _.each(wdUtils.elementFuncTypes, function(type) {
    methods.push("element" + wdUtils.elFuncSuffix(type));
    methods.push("elements" + wdUtils.elFuncSuffix(type));
  });
  return methods;
};

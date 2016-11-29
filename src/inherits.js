"use strict";

module.exports = exportsFn;

var util = require('util');

function exportsFn(ErrorsBase){
    ErrorsBase.inherits = inheritsFromError;
}

function inheritsFromError(constructor, parent){
    util.inherits(constructor, parent);
}
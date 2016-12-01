"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    ErrorsBase.inherits = inheritsFromError;
}

function inheritsFromError(constructor, parent){
    constructor.super_ = parent;
    constructor.prototype = Object.create(parent.prototype, {
        constructor: {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}
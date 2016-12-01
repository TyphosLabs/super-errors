"use strict";

module.exports = exportFn;

function exportFn(ErrorsBase){
    ErrorsBase.captureStackTrace = captureStackTrace;
}

function captureStackTrace(inst){
    // going to get the stack trace of an error
    inst.stack = (new Error("" + (inst.name ? inst.name + ': ' : '') + (inst.message || inst.safe_message))).stack;
}
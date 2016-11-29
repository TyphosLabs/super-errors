"use strict";

module.exports = exportFn;

function exportFn(ErrorsBase){
    ErrorsBase.captureStackTrace = captureStackTrace;
}

function captureStackTrace(inst, constructor){
    Error.captureStackTrace(inst, constructor);
}
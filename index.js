"use strict";

// ready to export
module.exports = exportFn;

function exportFn(){
    // base
    var Errors = require('./src/errors.js')();
    // inherits from Error
    require('./src/inherits.js')(Errors);
    require('./src/capture-stack.js')(Errors);
    
    // default classes
    require('./src/errors/auth-error.js')(Errors);
    require('./src/errors/dev-error.js')(Errors);
    require('./src/errors/http-request-error.js')(Errors);
    require('./src/errors/not-found-error.js')(Errors);
    require('./src/errors/notify-user.js')(Errors);
    
    return Errors;
}
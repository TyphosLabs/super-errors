"use strict";

// base
var Errors = module.exports = require('./src/errors.js')();

// inherits from Error
require('./src/inherits-client.js')(Errors);
require('./src/capture-stack-client.js')(Errors);

// default classes
require('./src/errors/auth-error.js')(Errors);
require('./src/errors/dev-error.js')(Errors);
require('./src/errors/not-found-error.js')(Errors);
require('./src/errors/notify-user.js')(Errors);
require('./src/errors/service-error.js')(Errors);
require('./src/errors/user-error.js')(Errors);
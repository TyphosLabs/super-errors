"use strict";

var Errors = require('@orchardcorset/errors-base')();

require('@orchardcorset/errors-inherits')(Errors);
require('@orchardcorset/errors-capture-stack')(Errors);
require('@orchardcorset/errors-default-types')(Errors);
require('@orchardcorset/errors-messages')(Errors);

// ready to export
module.exports = Errors;
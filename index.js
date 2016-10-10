"use strict";

var Errors = require('@typhoslabs/errors-base')();

require('@typhoslabs/errors-inherits')(Errors);
require('@typhoslabs/errors-capture-stack')(Errors);
require('@typhoslabs/errors-default-types')(Errors);
require('@typhoslabs/errors-messages')(Errors);

// ready to export
module.exports = Errors;
"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function AuthError(message, additional, from_error, field){
        this.init(AuthError, message, additional, from_error, field);
    }
    
    SuperErrors.create(AuthError, 'AuthError', 'Authorization required.', 401, true);
}
"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function AuthError(message, additional, from_error, field){
        this.init(AuthError, message, additional, from_error, field);
    }
    
    ErrorsBase.extend(AuthError, 'AuthError', 'Authorization required.', 401, true);
}
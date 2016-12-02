"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function AuthError(message, additional, from_error, field){
        return AuthError.init(this, arguments);
    }
    
    ErrorsBase.extend(AuthError, 'AuthError', 'Authorization required.', 401, true);
}
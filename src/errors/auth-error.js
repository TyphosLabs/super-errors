"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function AuthError(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof AuthError)){
            inst = new AuthError(AuthError);
        }
        
        if(arguments[0] !== AuthError){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(AuthError, 'AuthError', 'Authorization required.', 401);
}
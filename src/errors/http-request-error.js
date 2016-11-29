"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function HTTPRequestError(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof HTTPRequestError)){
            inst = new HTTPRequestError(HTTPRequestError);
        }
        
        if(arguments[0] !== HTTPRequestError){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(HTTPRequestError, 'HTTPRequestError', 'Bad response from server.', 500);
}
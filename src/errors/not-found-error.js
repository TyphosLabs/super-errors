"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function NotFoundError(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof NotFoundError)){
            inst = new NotFoundError(NotFoundError);
        }
        
        if(arguments[0] !== NotFoundError){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(NotFoundError, 'NotFoundError', 'Not found.', 404);
}
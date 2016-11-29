"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function DevError(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof DevError)){
            inst = new DevError(DevError);
        }
        
        if(arguments[0] !== DevError){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(DevError, 'DevError', 'Bad setup on server.', 500);
}
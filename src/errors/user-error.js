"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function UserError(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof UserError)){
            inst = new UserError(UserError);
        }
        
        if(arguments[0] !== UserError){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(UserError, 'UserError', 'Please check your input.', 400, true);
}
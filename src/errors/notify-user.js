"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function NotifyUser(message, additional, from_error, field){
        var inst = this;
        
        if(!(this instanceof NotifyUser)){
            inst = new NotifyUser(NotifyUser);
        }
        
        if(arguments[0] !== NotifyUser){
            inst.init(message, additional, from_error, field);
        }
        
        return inst;
    }
    
    ErrorsBase.extend(NotifyUser, 'NotifyUser', 'A server error occurred.', 500, true);
}
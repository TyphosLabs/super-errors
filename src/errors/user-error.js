"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function UserError(message, additional, from_error, field){
        return this.init(UserError, message, additional, from_error, field);
    }
    
    ErrorsBase.extend(UserError, 'UserError', 'Please check your input.', 400, true);
}
"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function UserError(message, additional, from_error, field){
        return this.init(UserError, message, additional, from_error, field);
    }
    
    SuperErrors.create(UserError, 'UserError', 'Please check your input.', 400, true);
}
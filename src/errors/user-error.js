"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function UserError(message, additional, from_error, field){
        return UserError.init(this, arguments);
    }
    
    ErrorsBase.extend(UserError, 'UserError', 'Please check your input.', 400, true);
}
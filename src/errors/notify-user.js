"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function NotifyUser(message, additional, from_error, field){
        return NotifyUser.init(this, arguments);
    }
    
    ErrorsBase.extend(NotifyUser, 'NotifyUser', 'A server error occurred.', 500, true);
}
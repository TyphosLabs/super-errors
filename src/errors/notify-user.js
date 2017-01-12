"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function NotifyUser(message, additional, from_error, field){
        return this.init(NotifyUser, message, additional, from_error, field);
    }
    
    SuperErrors.create(NotifyUser, 'NotifyUser', 'A server error occurred.', 500, true);
}
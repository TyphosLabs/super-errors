"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function NotFoundError(message, additional, from_error, field){
        return this.init(NotFoundError, message, additional, from_error, field);
    }
    
    SuperErrors.create(NotFoundError, 'NotFoundError', 'Not found.', 404, true);
}
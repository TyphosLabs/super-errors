"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function NotFoundError(message, additional, from_error, field){
        return this.init(NotFoundError, message, additional, from_error, field);
    }
    
    ErrorsBase.extend(NotFoundError, 'NotFoundError', 'Not found.', 404, true);
}
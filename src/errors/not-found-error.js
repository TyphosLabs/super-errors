"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function NotFoundError(message, additional, from_error, field){
        return NotFoundError.init(this, arguments);
    }
    
    ErrorsBase.extend(NotFoundError, 'NotFoundError', 'Not found.', 404, true);
}
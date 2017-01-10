"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function DevError(message, additional, from_error, field){
        return this.init(DevError, message, additional, from_error, field);
    }
    
    ErrorsBase.extend(DevError, 'DevError', 'Bad setup on server.', 500);
}
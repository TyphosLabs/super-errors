"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function DevError(message, additional, from_error, field){
        return this.init(DevError, message, additional, from_error, field);
    }
    
    SuperErrors.create(DevError, 'DevError', 'Bad setup on server.', 500);
}
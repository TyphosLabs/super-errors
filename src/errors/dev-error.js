"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function DevError(message, additional, from_error, field){
        return DevError.init(this, arguments);
    }
    
    ErrorsBase.extend(DevError, 'DevError', 'Bad setup on server.', 500);
}
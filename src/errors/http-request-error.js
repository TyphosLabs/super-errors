"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function HTTPRequestError(message, additional, from_error, field){
        return HTTPRequestError.init(this, arguments);
    }
    
    ErrorsBase.extend(HTTPRequestError, 'HTTPRequestError', 'Bad response from server.', 500);
}
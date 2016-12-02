"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function ServiceError(message, additional, from_error, field){
        return ServiceError.init(this, arguments);
    }
    
    ErrorsBase.extend(ServiceError, 'ServiceError', 'Error from service providor.', 500, true);
}
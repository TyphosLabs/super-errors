"use strict";

module.exports = exportsFn;

function exportsFn(ErrorsBase){
    
    function ServiceError(message, additional, from_error, field){
        return this.init(ServiceError, message, additional, from_error, field);
    }
    
    ErrorsBase.extend(ServiceError, 'ServiceError', 'Error from service providor.', 500, true);
}
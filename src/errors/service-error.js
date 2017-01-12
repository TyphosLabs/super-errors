"use strict";

module.exports = exportsFn;

function exportsFn(SuperErrors){
    
    function ServiceError(message, additional, from_error, field){
        return this.init(ServiceError, message, additional, from_error, field);
    }
    
    SuperErrors.create(ServiceError, 'ServiceError', 'Error from service providor.', 500, true);
}
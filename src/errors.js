"use strict";

module.exports = exportFn;

function exportFn(){
    var fn;
    
    function ErrorsBase(){
        if(typeof fn === 'function'){
            return fn.apply(this, arguments);
        }
    }
    
    ErrorsBase.setFn = function setErrorsBaseFn(error_fn){
        fn = error_fn;
    };
    
    ErrorsBase.add = addError;
    ErrorsBase.extend = extendError;
    ErrorsBase.rebase = rebaseError;
    
    return ErrorsBase;
}

function addError(base, field, err){
    // field is optional
    if(arguments.length === 2){
        err = field;
        field = err.field;
    }
    
    if(base === err){
        return base;
    }
    
    if(!base || typeof base !== 'object'){
        var throwing = new Error('Cannot add error to non object');
        throwing.errors = [err];
        throw throwing;
    }
    
    var f;
    
    if(field === undefined){
        if(!err.generic){
            if(base.generic){
                return rebaseError(base, err);
            } else {
                if(!base.errors){
                    base.errors = [err];
                } else {
                    if(!~base.errors.indexOf(err)){
                        base.errors.push(err);
                    }
                }
            }
        }
        
        if(err.errors){
            for(f = 0; f < err.errors.length; f++){
                base = addError(base, err.errors[f]);
            }
        }
        
        if(err.fields){
            for(f in err.fields){
                base = addError(base, f, err.fields[f]);
            }
        }
    } else {
        if(!base.fields){
            base.fields = {};
        }
        
        if(base.fields[field]){
            if(!err.generic && base.fields[field].generic){
                base.fields[field] = rebaseError(base.fields[field], err);
            } else {
                base.fields[field] = addError(base.fields[field], err);
            }
        } else {
            base.fields[field] = err;
        }
        
        if(err.fields){
            for(f in err.fields){
                base = addError(base, field + '.' + f, err.fields[f]);
            }
        }
    }
    
    return base;
}

function extendError(constructor, name, default_message, status_code, client_safe_messages){
    /*jshint validthis:true */
    
    // optional default message
    if(typeof default_message === 'number' || typeof default_message === 'boolean'){
        client_safe_messages = status_code;
        status_code = default_message;
        default_message = undefined;
    }
    
    // optional status code
    if(typeof status_code === 'boolean'){
        client_safe_messages = status_code;
        status_code = undefined;
    }
    
    var parent = (isErrorsBase(this) ? undefined : this);
    var base = (parent ? parent.prototype.base : this);
    
    if(base.inherits){
        base.inherits(constructor, (parent ? parent : Error));
    }
    
    if(parent){
        if(default_message === undefined){
            default_message = parent.prototype.message;
        }
        
        if(client_safe_messages === undefined){
            client_safe_messages = parent.prototype.client_safe_messages;
        }
        
        if(status_code === undefined){
            status_code = parent.prototype.status_code;
        }
        
        parent.prototype.base[name] = constructor;
    } else {
        this[name] = constructor;
    }
    
    default_message = default_message || 'There was an error.';
    
    constructor.prototype.base = this;
    constructor.prototype.base_constructor = constructor;
    constructor.prototype.client_safe_messages = (client_safe_messages ? true : false);
    constructor.prototype.init = initError;
    constructor.prototype.name = name;
    constructor.prototype.message = default_message;
    constructor.prototype.client_safe_message = default_message;
    constructor.prototype.status_code = (status_code && typeof status_code === 'number' ? status_code : 500);
    
    constructor.extend = this.extend;
    
    return constructor;
}

function initError(message, additional, error_from, field){
    /*jshint validthis:true */
    
    if(additional instanceof Error){
        field = error_from;
        error_from = additional;
        additional = undefined;
    }
    
    else if(typeof error_from === 'string'){
        field = error_from;
        error_from = undefined;
    }
    
    if(message){
        this.message = '' + message;
        
        if(this.client_safe_messages){
            this.client_safe_message = '' + message;
        }
    }
    
    if(error_from){
        this.from = error_from;
    }
    
    if(additional !== 'undefined' && additional !== null){
        this.additional = additional;
    }
    
    if(field && typeof field === 'string'){
        this.field = field;
    }
    
    if(this.base && this.base.captureStackTrace){
        this.base.captureStackTrace(this, this.base_constructor);
    }
}

function isErrorsBase(val){
    if(val && typeof val.setFn === 'function' && typeof val.add === 'function' && typeof val.extend === 'function' && typeof val.rebase === 'function'){
        return true;
    }
}

function rebaseError(base, err){
    // strip the errors and fields
    var errors, fields, field;
    
    if(err.errors){
        errors = err.errors;
        delete err.errors;
    }
    
    if(err.fields){
        fields = err.fields;
        delete err.fields;
    }
    
    // add base to err
    err = addError(err, base);
    
    // now add the errors back
    if(errors){
        err.errors = err.errors.concat(errors);
    }
    
    // and add the fields back
    if(fields){
        for(field in fields){
            err = addError(err, field, fields[field]);
        }
    }
    
    return err;
}
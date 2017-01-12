"use strict";

module.exports = exportFn;

var LINE_RETURNS = /(\r\n|\r|\n)/g;

function exportFn(){
    var fn;
    
    /**
     * Main export is a function that can be overridden by using setFn()
     */
    function SuperErrors(){
        if(typeof fn === 'function'){
            return fn.apply(this, arguments);
        }
    }
    
    /**
     * Pass a function to set the behavior of the SuperErrors function
     * @param {function} error_fn - function to be called when SuperErrors() is called
     */
    function setSuperErrorsFn(error_fn){
        fn = error_fn;
    }
    
    SuperErrors.setFn = setSuperErrorsFn;
    SuperErrors.add = addError;
    SuperErrors.create = createSuperError;
    SuperErrors.stack = getCustomStack;
    SuperErrors.rebase = rebaseError;
    
    return SuperErrors;
}

/**
 * Call to add an error to a base error.
 * @param {Error} base - the base error
 * @param {string} [field] - the field that this error was a result of
 * @param {Error} err - the error that occurred
 */
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

/**
 * Create a new Super Error
 * @param {Function} constructor - Constructor function for the error
 * @param {string} name - The error name (ex: AuthError, UserError)
 * @param {string} [default_message="There was an error."] - The message to display when no message is passed or when custom messages are defined as not client-safe
 * @param {number} [status_code=500] - The recommended HTTP status code to return to the user
 * @param {boolean} [client_safe_messages=false] - Whether or not messages should be sent back to the user or just the default message
 * @returns {Function}
 */
function createSuperError(constructor, name, default_message, status_code, client_safe_messages){
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
    
    // inheritance supported?
    if(this.inherits){
        this.inherits(constructor, Error);
    }
    
    // store on SuperErrors instance
    this[name] = constructor;
    
    // set default message
    default_message = default_message || 'There was an error.';
    
    // save default values
    constructor.prototype.name = name;
    constructor.prototype.message = default_message;
    constructor.prototype.client_safe_message = default_message;
    constructor.prototype.status_code = (status_code && typeof status_code === 'number' ? status_code : 500);
    constructor.prototype.isGeneric = setGeneric;
    constructor.prototype.init = initError;
    
    // add super errors to the constructor
    constructor.SuperErrors = this;
    constructor.client_safe_messages = (client_safe_messages ? true : false);
    
    return constructor;
}

/**
 * Will return a stack with additional info, fields, and errors that are attached to this error
 * @param {Error} err - The error to get the stack from
 * @param {boolean} [type=true] - Whether to include custom data in stack
 * @param {boolean|string} [__sub=true] - Internal. Whether to include sub errors in stack
 * @returns {string}
 */
function getCustomStack(err, type, __sub){
    /*jshint validthis:true */
    
    if(Array.isArray(err) && err.length > 0){
        err = {
            name: 'Array',
            message: '',
            errors: err
        };
    }
    
    var stack = getErrorStack(err);
    
    if(type === false){
        return stack;
    }
    
    if(err && (err.from || err.additional || (__sub !== false && (err.errors || err.fields)))){
        stack += '\n    ---';
        
        if(err.additional){
            try {
                stack += getSubStack('additional info', JSON.stringify(err.additional, null, '    '));
            } catch(err){
                stack += getSubStack('additional info error', err.message);
            }
        }
    
        if(err.from){
            stack += getSubStack('from', this.stack(err.from, true, false));
        }
        
        if(__sub !== false){
            if(err.errors && Array.isArray(err.errors)){
                for(var i = 0; i < err.errors.length; i++){
                    stack += getSubStack('additional error', this.stack(err.errors[i], true, false));
                }
            }
            
            if(__sub !== 'addl' && err.fields && typeof err.fields === 'object'){
                for(var field in err.fields){
                    stack += getSubStack(field, this.stack(err.fields[field], true, 'addl'));
                }
            }
        }
    }
    
    return stack;
}

/**
 * Gets the stack of the error value
 * @param {Error} err - The error value to get the stack from
 * @returns {string}
 */
function getErrorStack(err){
    var stack;
    
    if(!err || typeof err !== 'object' || Array.isArray(err)){
        try {
            if(err === undefined){
                err = 'undefined';
            }
            else if(typeof err === 'function'){
                err = '[function]';
            } else {
                err = JSON.stringify(err);
            }
        } catch(e){
            /* istanbul ignore next */
            err = '' + err;
        }
        err = { name:'UnknownError', message: '' + err + '.' };
    }
    
    if(!err.super_stack){
        stack = err.stack;
    } else {
        stack = err.error_stack;
    }
    
    if(!stack){
        stack = (err.name ? err.name + ': ' : 'UnknownError: ');
        if('message' in err){
            stack += err.message;
        } else {
            try {
                stack += JSON.stringify(err) + '.';
            } catch(e){
                stack += '' + err + '.';
            }
        }
    }
    
    return stack;
}

/**
 * Indents a substack string
 * @param {string} prefix - The substack title
 * @param {string} stack - The substack
 * @returns {string}
 */
function getSubStack(prefix, stack){
    var substack = '\n' + prefix + ': ' + stack;
    return substack.replace(LINE_RETURNS, '\n    ');
}

/**
 * Initialize an error based on arguments passed
 * @param {Function} constructor - Error constructor to use
 * @param {string} [message] - Error message
 * @param {*} [additional] - Additional information to be attached to the error
 * @param {Error} [error_from] - Error we want to wrap with our SuperError
 * @param {string} [field] - Field we want this error to be associated with
 */
function initError(constructor, message, additional, error_from, field){
    /*jshint validthis:true */
    var inst = this;
    var SuperErrors = constructor.SuperErrors;
    
    // optional additional information
    if(additional instanceof Error){
        field = error_from;
        error_from = additional;
        additional = undefined;
    }
    
    // optional error_from
    else if(typeof error_from === 'string'){
        field = error_from;
        error_from = undefined;
    }
    
    if(message){
        this.message = '' + message;
        
        if(constructor.client_safe_messages){
            this.client_safe_message = '' + message;
        }
    }
    
    if(error_from){
        this.from = error_from;
    }
    
    if(additional !== undefined && additional !== null){
        this.additional = additional;
    }
    
    if(field && typeof field === 'string'){
        this.field = field;
    }
    
    if(SuperErrors && SuperErrors.captureStackTrace){
        SuperErrors.captureStackTrace(this, constructor);
        this.error_stack = this.stack;
    }
    
    Object.defineProperty(this, 'stack', {
        get: function(){
            return SuperErrors.stack(inst);
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(this, 'super_stack', {
        value: true,
        enumerable: false,
        configurable: true
    });
    
    return this;
}

/**
 * Set a new error as the base error and attach the existing base error to the new base
 * @param {Error} old_base - The old base error
 * @param {Error} new_base - The new base error
 * @returns {Error}
 */
function rebaseError(old_base, new_base){
    // strip the errors and fields
    var errors, fields, field;
    
    if(new_base.errors){
        errors = new_base.errors;
        delete new_base.errors;
    }
    
    if(new_base.fields){
        fields = new_base.fields;
        delete new_base.fields;
    }
    
    new_base = addError(new_base, old_base);
    
    // now add the errors back
    if(errors){
        new_base.errors = new_base.errors.concat(errors);
    }
    
    // and add the fields back
    if(fields){
        for(field in fields){
            new_base = addError(new_base, field, fields[field]);
        }
    }
    
    return new_base;
}

/**
 * Chainable function to be attached to all SuperErrors
 * @param {boolean} [value=true] - Whether or the Error is generic
 * @returns {Error}
 */
function setGeneric(value){
    /* jshint validthis:true */
    this.generic = (value !== false);
    return this;
}
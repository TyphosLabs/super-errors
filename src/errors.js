"use strict";

module.exports = exportFn;

var LINE_RETURNS = /(\r\n|\r|\n)/g;

function exportFn(){
    var fn;
    
    function SuperErrors(){
        if(typeof fn === 'function'){
            return fn.apply(this, arguments);
        }
    }
    
    SuperErrors.setFn = function setSuperErrorsFn(error_fn){
        fn = error_fn;
    };
    
    SuperErrors.add = addError;
    SuperErrors.extend = extendError;
    SuperErrors.stack = getCustomStack;
    SuperErrors.rebase = rebaseError;
    
    return SuperErrors;
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
    
    var parent = (isSuperErrors(this) ? undefined : this);
    var base = (parent ? parent.base : this);
    
    if(base.inherits){
        base.inherits(constructor, (parent ? parent : Error));
    }
    
    if(parent){
        if(default_message === undefined){
            default_message = parent.prototype.message;
        }
        
        if(client_safe_messages === undefined){
            client_safe_messages = parent.client_safe_messages;
        }
        
        if(status_code === undefined){
            status_code = parent.prototype.status_code;
        }
        
        parent.base[name] = constructor;
    } else {
        this[name] = constructor;
    }
    
    default_message = default_message || 'There was an error.';
    
    constructor.prototype.name = name;
    constructor.prototype.message = default_message;
    constructor.prototype.client_safe_message = default_message;
    constructor.prototype.status_code = (status_code && typeof status_code === 'number' ? status_code : 500);
    
    constructor.base = this;
    constructor.client_safe_messages = (client_safe_messages ? true : false);
    constructor.init = initError;
    constructor.extend = this.extend;
    
    return constructor;
}

function getCustomStack(err, include_sub_errors){
    /*jshint validthis:true */ 
    var SuperErrors = this;
    
    if(Array.isArray(err) && err.length > 0){
        err = {
            name: 'Array',
            message: '',
            errors: err
        };
    }
    
    var stack = getErrorStack(err);
    
    if(err && (err.from || err.additional || (include_sub_errors !== false && (err.errors || err.fields)))){
        stack += '\n    ---';
    
        if(err.from){
            stack += getSubStack('from', SuperErrors.stack(err.from, false));
        }
        
        if(include_sub_errors !== false){
            if(err.errors && Array.isArray(err.errors)){
                for(var i = 0; i < err.errors.length; i++){
                    stack += getSubStack('additional error', SuperErrors.stack(err.errors[i], false));
                }
            }
            
            if(err.fields && typeof err.fields === 'object'){
                for(var field in err.fields){
                    stack += getSubStack(field, SuperErrors.stack(err.fields[field], false));
                }
            }
        }
        
        if(err.additional){
            try {
                stack += getSubStack('additional info', JSON.stringify(err.additional, null, '    '));
            } catch(err){
                stack += getSubStack('additional info error', err.message);
            }
        }
    }
    
    return stack;
}

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

function getSubStack(prefix, stack){
    var substack = '\n' + prefix + ': ' + stack;
    return substack.replace(LINE_RETURNS, '\n    ');
}

function initError(inst, args){
    /*jshint validthis:true */
    
    if(!(inst instanceof this)){
        inst = new this(this);
    }
    
    if(args.length === 1 && args[0] === this){
        return;
    }
    
    var message = args[0];
    var additional = args[1];
    var error_from = args[2];
    var field = args[3];
    var SuperErrors = this.base;
    
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
        inst.message = '' + message;
        
        if(this.client_safe_messages){
            inst.client_safe_message = '' + message;
        }
    }
    
    if(error_from){
        inst.from = error_from;
    }
    
    if(additional !== 'undefined' && additional !== null){
        inst.additional = additional;
    }
    
    if(field && typeof field === 'string'){
        inst.field = field;
    }
    
    if(this.base.captureStackTrace){
        SuperErrors.captureStackTrace(inst, this);
        inst.error_stack = inst.stack;
    }
    
    Object.defineProperty(inst, 'stack', {
        get: function(){
            return SuperErrors.stack(inst);
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(inst, 'super_stack', {
        value: true,
        enumerable: false,
        configurable: true
    });
    
    return inst;
}

function isSuperErrors(val){
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
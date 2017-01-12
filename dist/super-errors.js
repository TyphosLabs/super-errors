!function r(e,t,s){function i(n,c){if(!t[n]){if(!e[n]){var f="function"==typeof require&&require;if(!c&&f)return f(n,!0);if(o)return o(n,!0);var a=new Error("Cannot find module '"+n+"'");throw a.code="MODULE_NOT_FOUND",a}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(r){var t=e[n][1][r];return i(t?t:r)},u,u.exports,r,e,t,s)}return t[n].exports}for(var o="function"==typeof require&&require,n=0;n<s.length;n++)i(s[n]);return i}({1:[function(r,e,t){"use strict";var s=e.exports=r("./src/errors.js")();r("./src/inherits-client.js")(s),r("./src/capture-stack-client.js")(s),r("./src/errors/auth-error.js")(s),r("./src/errors/dev-error.js")(s),r("./src/errors/not-found-error.js")(s),r("./src/errors/notify-user.js")(s),r("./src/errors/service-error.js")(s),r("./src/errors/user-error.js")(s)},{"./src/capture-stack-client.js":2,"./src/errors.js":3,"./src/errors/auth-error.js":4,"./src/errors/dev-error.js":5,"./src/errors/not-found-error.js":6,"./src/errors/notify-user.js":7,"./src/errors/service-error.js":8,"./src/errors/user-error.js":9,"./src/inherits-client.js":10}],2:[function(r,e,t){"use strict";function s(r){r.captureStackTrace=i}function i(r){r.stack=new Error(""+(r.name?r.name+": ":"")+(r.message||r.safe_message)).stack}e.exports=s},{}],3:[function(r,e,t){"use strict";function s(){function r(){if("function"==typeof t)return t.apply(this,arguments)}function e(r){t=r}var t;return r.setFn=e,r.add=i,r.create=o,r.stack=n,r.rebase=u,r}function i(r,e,t){if(2===arguments.length&&(t=e,e=t.field),r===t)return r;if(!r||"object"!=typeof r){var s=new Error("Cannot add error to non object");throw s.errors=[t],s}var o;if(void 0===e){if(!t.generic){if(r.generic)return u(r,t);r.errors?~r.errors.indexOf(t)||r.errors.push(t):r.errors=[t]}if(t.errors)for(o=0;o<t.errors.length;o++)r=i(r,t.errors[o]);if(t.fields)for(o in t.fields)r=i(r,o,t.fields[o])}else if(r.fields||(r.fields={}),r.fields[e]?!t.generic&&r.fields[e].generic?r.fields[e]=u(r.fields[e],t):r.fields[e]=i(r.fields[e],t):r.fields[e]=t,t.fields)for(o in t.fields)r=i(r,e+"."+o,t.fields[o]);return r}function o(r,e,t,s,i){return"number"!=typeof t&&"boolean"!=typeof t||(i=s,s=t,t=void 0),"boolean"==typeof s&&(i=s,s=void 0),this.inherits&&this.inherits(r,Error),this[e]=r,t=t||"There was an error.",r.prototype.name=e,r.prototype.message=t,r.prototype.client_safe_message=t,r.prototype.status_code=s&&"number"==typeof s?s:500,r.prototype.isGeneric=d,r.prototype.init=a,r.SuperErrors=this,r.client_safe_messages=!!i,r}function n(r,e,t){Array.isArray(r)&&r.length>0&&(r={name:"Array",message:"",errors:r});var s=c(r);if(e===!1)return s;if(r&&(r.from||r.additional||t!==!1&&(r.errors||r.fields))){if(s+="\n    ---",r.additional)try{s+=f("additional info",JSON.stringify(r.additional,null,"    "))}catch(r){s+=f("additional info error",r.message)}if(r.from&&(s+=f("from",this.stack(r.from,!0,!1))),t!==!1){if(r.errors&&Array.isArray(r.errors))for(var i=0;i<r.errors.length;i++)s+=f("additional error",this.stack(r.errors[i],!0,!1));if("addl"!==t&&r.fields&&"object"==typeof r.fields)for(var o in r.fields)s+=f(o,this.stack(r.fields[o],!0,"addl"))}}return s}function c(r){var e;if(!r||"object"!=typeof r||Array.isArray(r)){try{r=void 0===r?"undefined":"function"==typeof r?"[function]":JSON.stringify(r)}catch(e){r=""+r}r={name:"UnknownError",message:""+r+"."}}if(e=r.super_stack?r.error_stack:r.stack,!e)if(e=r.name?r.name+": ":"UnknownError: ","message"in r)e+=r.message;else try{e+=JSON.stringify(r)+"."}catch(t){e+=""+r+"."}return e}function f(r,e){var t="\n"+r+": "+e;return t.replace(l,"\n    ")}function a(r,e,t,s,i){var o=this,n=r.SuperErrors;return t instanceof Error?(i=s,s=t,t=void 0):"string"==typeof s&&(i=s,s=void 0),e&&(this.message=""+e,r.client_safe_messages&&(this.client_safe_message=""+e)),s&&(this.from=s),void 0!==t&&null!==t&&(this.additional=t),i&&"string"==typeof i&&(this.field=i),n&&n.captureStackTrace&&(n.captureStackTrace(this,r),this.error_stack=this.stack),Object.defineProperty(this,"stack",{get:function(){return n.stack(o)},enumerable:!0,configurable:!0}),Object.defineProperty(this,"super_stack",{value:!0,enumerable:!1,configurable:!0}),this}function u(r,e){var t,s,o;if(e.errors&&(t=e.errors,delete e.errors),e.fields&&(s=e.fields,delete e.fields),e=i(e,r),t&&(e.errors=e.errors.concat(t)),s)for(o in s)e=i(e,o,s[o]);return e}function d(r){return this.generic=r!==!1,this}e.exports=s;var l=/(\r\n|\r|\n)/g},{}],4:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){this.init(e,r,t,s,i)}r.create(e,"AuthError","Authorization required.",401,!0)}e.exports=s},{}],5:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){return this.init(e,r,t,s,i)}r.create(e,"DevError","Bad setup on server.",500)}e.exports=s},{}],6:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){return this.init(e,r,t,s,i)}r.create(e,"NotFoundError","Not found.",404,!0)}e.exports=s},{}],7:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){return this.init(e,r,t,s,i)}r.create(e,"NotifyUser","A server error occurred.",500,!0)}e.exports=s},{}],8:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){return this.init(e,r,t,s,i)}r.create(e,"ServiceError","Error from service providor.",500,!0)}e.exports=s},{}],9:[function(r,e,t){"use strict";function s(r){function e(r,t,s,i){return this.init(e,r,t,s,i)}r.create(e,"UserError","Please check your input.",400,!0)}e.exports=s},{}],10:[function(r,e,t){"use strict";function s(r){r.inherits=i}function i(r,e){r.super_=e,r.prototype=Object.create(e.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}e.exports=s},{}]},{},[1]);
//# sourceMappingURL=super-errors.js.map

"use strict";

/*global describe:true, it:true*/

var Chai = require('chai');
var DirtyChai = require('dirty-chai');
var expect = Chai.expect;

Chai.use(DirtyChai);

var Errors = require('../src/errors.js')();

describe('Errors', function(){
    
    describe('add()', function(){
        it('should exist', function(){
            expect(Errors.add).to.be.a('function');
        });
        
        it('should add an error to another err', function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            err1 = Errors.add(err1, err2);
            
            expect(err1).to.have.key('errors');
            expect(err1.errors).to.deep.equal([ err2 ]);
        });
        
        it('should add an error as a field', function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            err1 = Errors.add(err1, 'test', err2);
            
            expect(err1).to.have.key('fields');
            expect(err1.fields).to.deep.equal({ test: err2 });
        });
        
        it('should use "field" on an error if no field was passed', function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            err2.field = 'test';
            
            err1 = Errors.add(err1, err2);
            
            expect(err1).to.have.key('fields');
            expect(err1.fields).to.deep.equal({ test: err2 });
        });
        
        it('should not use "field" on an error if field was passed but falsy', function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            err2.field = 'test';
            
            err1 = Errors.add(err1, undefined, err2);
            
            expect(err1).to.not.have.key('fields');
            expect(err1).to.have.key('errors');
            expect(err1.errors).to.deep.equal([ err2 ]);
        });
        
        it("should throw if base error is not an object", function(){
            var err;
            var err1 = new Error('Err!');
            
            try {
                Errors.add('bad', err1);
            } catch(e){
                err = e;
            }
            
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.have.key('errors');
            expect(err.errors).to.deep.equal([err1]);
        });
        
        it("should be able to add multiple errors to the same base error", function(){
            var test_err1 = new Error('test error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            
            test_err1 = Errors.add(test_err1, 'test', err2);
            test_err1 = Errors.add(test_err1, 'test2', err3);
            
            expect(test_err1).to.have.key('fields');
            expect(test_err1.fields).to.deep.equal({ test: err2, test2:err3 });
            
            var test_err2 = new Error('test error 2');
            
            test_err2 = Errors.add(test_err2, err2);
            test_err2 = Errors.add(test_err2, err3);
            
            expect(test_err2).to.have.key('errors');
            expect(test_err2.errors).to.deep.equal([ err2, err3 ]);
        });
        
        it("it should add the errors of the error being added to the parent", function(){
            var err1 = new Error('test error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            
            err1 = Errors.add(err1, err2);
            err1 = Errors.add(err1, err3);
            
            expect(err1).to.have.key('errors');
            expect(err1.errors).to.deep.equal([ err2, err3 ]);
            
            var test_err = new Error('test error 2');
            
            test_err = Errors.add(test_err, err1);
            
            expect(test_err).to.have.key('errors');
            expect(test_err.errors).to.deep.equal([ err1, err2, err3 ]);
        });
        
        it("it should add the errors of the error being added to the parent field", function(){
            var err1 = new Error('test error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            
            err1 = Errors.add(err1, err2);
            err1 = Errors.add(err1, err3);
            
            expect(err1).to.have.key('errors');
            expect(err1.errors).to.deep.equal([ err2, err3 ]);
            
            var test_err = new Error('test error 2');
            
            test_err = Errors.add(test_err, 'test', err1);
            
            expect(test_err).to.have.key('fields');
            expect(test_err.fields).to.deep.equal({ test: err1 });
            expect(test_err.fields.test).to.have.key('errors');
            expect(test_err.fields.test.errors).to.deep.equal([ err2, err3 ]);
        });
        
        it("it should add the errors of the error being added to the parent using the parent field", function(){
            var err1 = new Error('test error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            var err4 = new Error('error 4');
            
            err1 = Errors.add(err1, err2);
            err1 = Errors.add(err1, err3);
            
            expect(err1).to.have.key('errors');
            expect(err1.errors).to.deep.equal([ err2, err3 ]);
            
            var test_err = new Error('test error 2');
            
            test_err = Errors.add(test_err, 'test', err4);
            test_err = Errors.add(test_err, 'test', err1);
            
            expect(test_err).not.to.have.key('errors');
            expect(test_err).to.have.key('fields');
            expect(test_err.fields).to.deep.equal({ test: err4 });
            expect(test_err.fields.test.errors).to.deep.equal([ err1, err2, err3 ]);
        });
        
        it("it should add the fields, of the error being added, to the parent using the parent field", function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            var err4 = new Error('error 4');
            
            err1 = Errors.add(err1, 'field', err2);
            err1 = Errors.add(err1, 'field', err3);
            
            expect(err1).to.have.key('fields');
            expect(err1.fields).to.deep.equal({ field: err2 });
            
            var test_err = new Error('test error');
            
            test_err = Errors.add(test_err, 'test', err4);
            test_err = Errors.add(test_err, 'test', err1);
            
            expect(test_err).not.to.have.key('errors');
            expect(test_err).to.have.key('fields');
            expect(test_err.fields).to.deep.equal({ "test": err4, "test.field": err2 });
            expect(test_err.fields.test.errors).to.deep.equal([ err1 ]);
            expect(test_err.fields["test.field"].errors).to.deep.equal([ err3 ]);
        });
        
        it('should not add an error to itself', function(){
            var err = new Error('test');
            
            expect(function(){
                err = Errors.add(err, err);
            }).not.to.throw();
            
            expect(err).to.not.have.key('errors');
        });
        
        it("should not add an error that has already been added", function(){
            var err = new Error('test');
            var err2 = new Error('test 2');
            
            err = Errors.add(err, err2);
            err = Errors.add(err, err2);
            
            expect(err).to.have.key('errors');
            expect(err.errors).to.deep.equal([err2]);
        });
        
        it("should not add a sub error that has already been added", function(){
            var err = new Error('test');
            var err2 = new Error('test 2');
            
            err2 = Errors.add(err2, err);
            err = Errors.add(err, err2);
            
            expect(err).to.have.key('errors');
            expect(err.errors).to.deep.equal([err2]);
        });
        
        it("should not add a sub error field that has already been added", function(){
            var err = new Error('test');
            var err2 = new Error('test 2');
            
            err2 = Errors.add(err2, 'field', err);
            err = Errors.add(err, err2);
            
            expect(err).to.have.key('errors');
            expect(err.errors).to.deep.equal([err2]);
            expect(err).to.not.have.key('fields');
        });
        
        it("should rebase if the base is generic and the new error added is not", function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            err1.generic = true;
            
            var base = Errors.add(err1, err2);
            
            expect(base).to.equal(err2);
            expect(base).to.not.contain.key('errors');
        });
        
        it("should rebase fields if they are generic but the new field error is not", function(){
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            var err3 = new Error('error 3');
            var err4 = new Error('error 4');
            
            err3.generic = true;
            
            err1 = Errors.add(err1, 'test', err3);
            err2 = Errors.add(err2, 'test', err4);
            
            var base = Errors.add(err1, err2);
            
            expect(base).to.equal(err1);
            expect(base).to.contain.key('fields');
            expect(base.fields).to.deep.equal({ test:err4 });
            expect(base.fields.test).to.not.contain.key('errors');
        });
    });
    
    describe('extend()', function(){
        it('should exist', function(){
            expect(Errors.extend).to.be.a('function');
        });
        
        it('should create a new Error class', function(){
            var Errors = require('../src/errors.js')();
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'There was a test error.', 400, true);
            
            expect(TestError.client_safe_messages).to.equal(true);
            
            expect(Errors.TestError).to.be.a('function');
            
            var addl = { sent: 'abc' };
            var from_error = new Error('Bad stuff...');
            var test_error = new Errors.TestError('Test...', addl, from_error, 'test');
            
            expect(test_error.message).to.equal('Test...');
            expect(test_error.client_safe_message).to.equal('Test...');
            expect(test_error.status_code).to.equal(400);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(addl);
            expect(test_error.from).to.equal(from_error);
            expect(test_error.field).to.equal('test');
            
            test_error = new Errors.TestError('Test2...');
            
            expect(test_error.message).to.equal('Test2...');
            expect(test_error.client_safe_message).to.equal('Test2...');
            expect(test_error.status_code).to.equal(400);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(undefined);
            expect(test_error.from).to.equal(undefined);
            expect(test_error.field).to.equal(undefined);
            
            test_error = new Errors.TestError('Test3...', from_error);
            
            expect(test_error.message).to.equal('Test3...');
            expect(test_error.client_safe_message).to.equal('Test3...');
            expect(test_error.status_code).to.equal(400);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(undefined);
            expect(test_error.from).to.equal(from_error);
            expect(test_error.field).to.equal(undefined);
            
            test_error = new Errors.TestError('Test4...', null, 'test');
            
            expect(test_error.message).to.equal('Test4...');
            expect(test_error.client_safe_message).to.equal('Test4...');
            expect(test_error.status_code).to.equal(400);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(undefined);
            expect(test_error.from).to.equal(undefined);
            expect(test_error.field).to.equal('test');
        });
        
        it('should default to not client_safe_messages, "There was an error.", and 500 status code.', function(){
            var Errors = require('../src/errors.js')();
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            expect(Errors.TestError).to.be.a('function');
            expect(TestError.client_safe_messages).to.equal(false);
            
            var test_error = new Errors.TestError();
            
            expect(test_error.message).to.equal("There was an error.");
            expect(test_error.client_safe_message).to.equal("There was an error.");
            expect(test_error.status_code).to.equal(500);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(undefined);
            expect(test_error.from).to.equal(undefined);
            expect(test_error.field).to.equal(undefined);
        });
        
        it('should handle status code being optional', function(){
            var Errors = require('../src/errors.js')();
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', true);
            
            expect(Errors.TestError).to.be.a('function');
            expect(TestError.client_safe_messages).to.equal(true);
            
            var test_error = new Errors.TestError('Test...');
            
            expect(test_error.message).to.equal("Test...");
            expect(test_error.client_safe_message).to.equal("Test...");
            expect(test_error.status_code).to.equal(500);
            expect(test_error.name).to.equal('TestError');
            expect(test_error.additional).to.equal(undefined);
            expect(test_error.from).to.equal(undefined);
            expect(test_error.field).to.equal(undefined);
        });
        
        it('should use base.inherits if present', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var test_error = new Errors.TestError('Test...');
            expect(test_error).to.be.an.instanceof(Error);
        });
        
        it('should be able to extend one error to another', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'There was a test error.', 400, true);
            
            function TestError2(message, additional, error_from, field){
                return TestError2.init(this, arguments);
            }
            TestError.extend(TestError2, 'TestError2', 'There was a test error 2...', 401, false);
            
            expect(TestError.client_safe_messages).to.equal(true);
            expect(TestError2.client_safe_messages).to.equal(false);
            
            var test_error = new Errors.TestError2();
            expect(test_error).to.be.an.instanceof(Error);
            expect(test_error).to.be.an.instanceof(TestError);
            expect(test_error.message).to.equal('There was a test error 2...');
            expect(test_error.client_safe_message).to.equal('There was a test error 2...');
            expect(test_error.status_code).to.equal(401);
            expect(test_error.name).to.equal('TestError2');
        });
        
        it('should be able to extend one error to another inheriting the parent defaults', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'There was a test error.', 400, true);
            
            function TestError2(message, additional, error_from, field){
                return TestError2.init(this, arguments);
            }
            TestError.extend(TestError2, 'TestError2');
            
            expect(TestError.client_safe_messages).to.equal(true);
            expect(TestError2.client_safe_messages).to.equal(true);
            
            var test_error = new Errors.TestError2();
            expect(test_error).to.be.an.instanceof(Error);
            expect(test_error).to.be.an.instanceof(TestError);
            expect(test_error.message).to.equal('There was a test error.');
            expect(test_error.client_safe_message).to.equal('There was a test error.');
            expect(test_error.status_code).to.equal(400);
            expect(test_error.name).to.equal('TestError2');
        });
        
        it('should capture the stack trace if available', function(){
            var Errors = require('../src/errors.js')();
            require('../src/capture-stack.js')(Errors);
            
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var test_error = new Errors.TestError('Test...');
            expect(test_error.stack).to.match(/^TestError\: Test\.\.\..*(\r\n|\r|\n).*test\-errors\.js/);
        });
    });
    
    describe('setFn()', function(){
        it('should exist', function(){
            expect(Errors.setFn).to.be.a('function');
        });
    
        it('should override how Errors called as a function behaves', function(){
            var Errors = require('../src/errors.js')();
            expect(Errors()).to.equal(undefined);
            Errors.setFn(function(){ return 'hello world!'; });
            expect(Errors()).to.equal('hello world!');
        });
    });
    
    describe('rebase()', function(){
        it('should exist', function(){
            expect(Errors.rebase).to.be.a('function');
        });
        
        it('should swap err and base', function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.have.key('errors');
            expect(new_base.errors).to.deep.equal([base]);
        });
        
        it('should move errors from the base to the new error', function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            var err1 = new Error('error 1');
            
            base = Errors.add(base, err1);
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.have.key('errors');
            expect(new_base.errors).to.deep.equal([base, err1]);
        });
        
        it('should move fields from the base to the new error', function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            var err1 = new Error('error 1');
            
            base = Errors.add(base, 'test', err1);
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.have.keys(['fields', 'errors']);
            expect(new_base.fields).to.deep.equal({ test:err1 });
            expect(new_base.errors).to.deep.equal([ base ]);
        });
        
        it("should keep errors on the error but move them after the base and it's errors", function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            var err1 = new Error('error 1');
            
            err = Errors.add(err, err1);
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.have.key('errors');
            expect(new_base.errors).to.deep.equal([base, err1]);
        });
        
        it("should keep fields on the error but but will be secondary to any that were already existing on the base error", function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            var err1 = new Error('error 1');
            
            err = Errors.add(err, 'test', err1);
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.contain.key('fields');
            expect(new_base.fields).to.deep.equal({ test:err1 });
            expect(new_base).to.contain.key('errors');
            expect(new_base.errors).to.deep.equal([ base ]);
        });
        
        it("should discard the base if it is generic", function(){
            var base = new Error('base error');
            var err = new Error('new base error');
            var err1 = new Error('error 1');
            var err2 = new Error('error 2');
            
            base.generic = true;
            
            base = Errors.add(base, err1);
            err = Errors.add(err, err2);
            
            var new_base = Errors.rebase(base, err);
            
            expect(new_base).to.equal(err);
            expect(new_base).to.have.key('errors');
            expect(new_base.errors).to.deep.equal([ err1, err2 ]);
        });
    });
    
    describe('AuthError', function(){
        it('should return 401 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.AuthError('auth message', { additional:'AuthError' }, new Error('test error'), 'AuthError');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.AuthError);
            expect(err.message).to.equal('auth message');
            expect(err.client_safe_message).to.equal('Authorization required.');
            expect(err.status_code).to.equal(401);
            expect(err.name).to.equal('AuthError');
            expect(err.additional).to.deep.equal({ additional:'AuthError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('AuthError: auth message');
            expect(err.stack).to.match(/^AuthError\: auth message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('AuthError');
        });
    });
    
    describe('DevError', function(){
        it('should return 500 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.DevError('dev message', { additional:'DevError' }, new Error('test error'), 'DevError');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.DevError);
            expect(err.message).to.equal('dev message');
            expect(err.client_safe_message).to.equal('Bad setup on server.');
            expect(err.status_code).to.equal(500);
            expect(err.name).to.equal('DevError');
            expect(err.additional).to.deep.equal({ additional:'DevError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('DevError: dev message');
            expect(err.stack).to.match(/^DevError\: dev message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('DevError');
        });
    });
    
    describe('HTTPRequestError', function(){
        it('should return 500 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.HTTPRequestError('http request error message', { additional:'HTTPRequestError' }, new Error('test error'), 'HTTPRequestError');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.HTTPRequestError);
            expect(err.message).to.equal('http request error message');
            expect(err.client_safe_message).to.equal('Bad response from server.');
            expect(err.status_code).to.equal(500);
            expect(err.name).to.equal('HTTPRequestError');
            expect(err.additional).to.deep.equal({ additional:'HTTPRequestError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('HTTPRequestError: http request error message');
            expect(err.stack).to.match(/^HTTPRequestError\: http request error message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('HTTPRequestError');
        });
    });
    
    describe('NotFoundError', function(){
        it('should return 404 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.NotFoundError('not found message', { additional:'NotFoundError' }, new Error('test error'), 'NotFoundError');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.NotFoundError);
            expect(err.message).to.equal('not found message');
            expect(err.client_safe_message).to.equal('Not found.');
            expect(err.status_code).to.equal(404);
            expect(err.name).to.equal('NotFoundError');
            expect(err.additional).to.deep.equal({ additional:'NotFoundError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('NotFoundError: not found message');
            expect(err.stack).to.match(/^NotFoundError\: not found message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('NotFoundError');
        });
    });
    
    describe('NotifyUser', function(){
        it('should return 500 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.NotifyUser('user message', { additional:'NotifyUser' }, new Error('test error'), 'NotifyUser');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.NotifyUser);
            expect(err.message).to.equal('user message');
            expect(err.client_safe_message).to.equal('user message');
            expect(err.status_code).to.equal(500);
            expect(err.name).to.equal('NotifyUser');
            expect(err.additional).to.deep.equal({ additional:'NotifyUser' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('NotifyUser: user message');
            expect(err.stack).to.match(/^NotifyUser\: user message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('NotifyUser');
        });
    });
    
    describe('UserError', function(){
        it('should return 500 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = Errors.UserError('notify user message', { additional:'UserError' }, new Error('test error'), 'UserError');
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.UserError);
            expect(err.message).to.equal('notify user message');
            expect(err.client_safe_message).to.equal('notify user message');
            expect(err.status_code).to.equal(400);
            expect(err.name).to.equal('UserError');
            expect(err.additional).to.deep.equal({ additional:'UserError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('UserError: notify user message');
            expect(err.stack).to.match(/^UserError\: notify user message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('UserError');
        });
    });
});
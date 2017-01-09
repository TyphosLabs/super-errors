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
        
        it('should throw if error created without "new" operator', function(){
            var Errors = require('../src/errors.js')();
            
            function TestError(message, additional, error_from, field){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            expect(function(){
                Errors.TestError('Test...');
            }).to.throw(Error, /^SuperErrors\: Missing "new" operator when trying to create a Super Error\.$/);
        });
    });
    
    describe('generic()', function(){
        it('should exist on a super error instance', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'Test error.', 500, true);
            
            var t = new Errors.TestError('test');
            expect(t.isGeneric).to.be.a('function');
            expect(t.isGeneric()).to.equal(t);
            expect(t.generic).to.equal(true);
            expect(t.isGeneric(false)).to.equal(t);
            expect(t.generic).to.equal(false);
        });
    });
    
    describe('json()', function(){
        it('should return a client-safe JSON serializable object by default', function(){
            expect(Errors.json({ message:'hi' })).to.deep.equal({ message:'There was an error.', name:'UnknownError', status_code:500 });
            expect(Errors.json({ name:'NotifyUser', client_safe_message:'Bad stuff happened...', stack:'unsafe...', status_code:400 })).to.deep.equal({ name:'NotifyUser', message:'Bad stuff happened...', status_code:400 });
        });
        
        it('should handle primative types', function(){
            var default_json = { message:'There was an error.', name:'UnknownError', status_code:500 };
            expect(Errors.json(true)).to.deep.equal(default_json);
            expect(Errors.json(false)).to.deep.equal(default_json);
            expect(Errors.json('')).to.deep.equal(default_json);
            expect(Errors.json({})).to.deep.equal(default_json);
            expect(Errors.json([])).to.deep.equal(default_json);
            expect(Errors.json([[]])).to.deep.equal(default_json);
            expect(Errors.json([{}])).to.deep.equal(default_json);
            expect(Errors.json([{}, {}])).to.deep.equal({
                errors:["There was an error."],
                message:'There was an error.',
                name:'UnknownError',
                status_code:500
            });
            expect(Errors.json(function(){ return 'hi'; })).to.deep.equal(default_json);
        });
        
        it('should handle all the values', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'Test error.', 500, true);
            
            var addl = new Errors.TestError('additional error', 'additional additional', new Errors.TestError('from additional'));
            Errors.add(addl, new Errors.TestError('additional additional error'));
            Errors.add(addl, 'field', new Errors.TestError('additional field error'));
            
            var field = new Errors.TestError('field error', 'field additional', new Errors.TestError('from field'));
            Errors.add(field, new Errors.TestError('field additional error'));
            Errors.add(field, 'field', new Errors.TestError('field field error'));
            
            var err = new Errors.TestError('test error', 'additional info', new Errors.TestError('from'));
            Errors.add(err, addl);
            Errors.add(err, 'field', field);
            
            expect(Errors.json(err)).to.deep.equal({
                errors: [
                    "additional error",
                    "additional additional error"
                ],
                fields: {
                    field: "additional field error",
                    "field.field": "field field error"
                },
                message: "test error",
                name: "TestError",
                status_code: 500
            });
        });
        
        it('should be able to map all', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError', 'Test error.', 500, true);
            
            var addl = new Errors.TestError('additional error', 'additional additional', new Errors.TestError('from additional'));
            Errors.add(addl, new Errors.TestError('additional additional error'));
            Errors.add(addl, 'field', new Errors.TestError('additional field error'));
            
            var field = new Errors.TestError('field error', 'field additional', new Errors.TestError('from field'));
            Errors.add(field, new Errors.TestError('field additional error'));
            Errors.add(field, 'field', new Errors.TestError('field field error'));
            
            var err = new Errors.TestError('test error', 'additional info', new Errors.TestError('from'));
            Errors.add(err, addl);
            Errors.add(err, 'field', field);
            
            expect(Errors.json(err, 'all')).to.deep.equal({
                client_safe_message: "test error",
                errors: [
                    {
                        client_safe_message: "additional error",
                        from: {
                            client_safe_message: "from additional",
                            message: "from additional",
                            name: "TestError",
                            stack: "TestError: from additional"
                        },
                        message: "additional error",
                        name: "TestError",
                        stack: "TestError: additional error"
                    },
                    {
                        client_safe_message: "additional additional error",
                        message: "additional additional error",
                        name: "TestError",
                        stack: "TestError: additional additional error"
                    }
                ],
                fields: {
                    field: {
                        client_safe_message: "additional field error",
                        errors: [
                            {
                                client_safe_message: "field error",
                                from: {
                                    client_safe_message: "from field",
                                    message: "from field",
                                    name: "TestError",
                                    stack: "TestError: from field"
                                },
                                message: "field error",
                                name: "TestError",
                                stack: "TestError: field error"
                            },
                            {
                                client_safe_message: "field additional error",
                                message: "field additional error",
                                name: "TestError",
                                stack: "TestError: field additional error"
                            }
                        ],
                        message: "additional field error",
                        name: "TestError",
                        stack: "TestError: additional field error"
                    },
                    "field.field": {
                        client_safe_message: "field field error",
                        message: "field field error",
                        name: "TestError",
                        stack: "TestError: field field error"
                    }
                },
                from: {
                    client_safe_message: "from",
                    message: "from",
                    name: "TestError",
                    stack: "TestError: from"
                },
                message: "test error",
                name: "TestError",
                stack: "TestError: test error",
                status_code: 500
            });
        });
        
        it('should not include errors if errors is an empty array', function(){
            expect(Errors.json({ errors:[] })).to.deep.equal({
                message: "There was an error.",
                name: "UnknownError",
                status_code: 500
            });
        });
        
        it('should work with a from subfield map', function(){
            expect(Errors.json({ from:{ message:'test' } }, { "from.message":'error_from' })).to.deep.equal({
                error_from: 'test'
            });
        });
        
        it('should allow deep exclusion definitions', function(){
            expect(Errors.json(
                {
                    from:{ message:'test' },
                    errors: [{ message:'test2' }],
                    fields: { test: { message:'test3' } }
                },
                'all',
                {
                    client_safe_message:true,
                    from: { status_code:true, name:true, stack:true },
                    errors: { status_code:true, name:true, stack:true },
                    fields: { status_code:true, name:true, stack:true },
                    stack:true,
                    status_code:true
                }
            )).to.deep.equal({
                from: { message:'test' },
                errors: [{ message:'test2' }],
                fields: {
                    test: { message:'test3' }
                },
                message: 'There was an error.',
                name: 'UnknownError'
            });
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
    
    describe('stack()', function(){
        it('should return the error stack', function(){
            var Errors = require('../src/errors.js')();
            expect(Errors.stack(new Error('test error'))).to.match(/^Error: test error.*(\r\n|\r|\n).*test-errors.js/);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            expect(Errors.stack(new Errors.TestError('test error'))).to.match(/^TestError: test error$/);
            
            require('../src/capture-stack.js')(Errors);
            
            expect(Errors.stack(new Errors.TestError('test error'))).to.match(/^TestError: test error.*(\r\n|\r|\n).*test-errors.js/);
        });
        it('should handle primative types', function(){
            expect(Errors.stack(true)).to.equal('UnknownError: true.');
            expect(Errors.stack(false)).to.equal('UnknownError: false.');
            expect(Errors.stack(undefined)).to.equal('UnknownError: undefined.');
            expect(Errors.stack(null)).to.equal('UnknownError: null.');
            expect(Errors.stack('')).to.equal('UnknownError: "".');
            expect(Errors.stack(1)).to.equal('UnknownError: 1.');
            expect(Errors.stack(function(){ return 'hi'; })).to.equal('UnknownError: [function].');
            expect(Errors.stack([])).to.equal('UnknownError: [].');
            expect(Errors.stack([1, 2, 3])).to.equal("Array: \n    ---\n    additional error: UnknownError: 1.\n    additional error: UnknownError: 2.\n    additional error: UnknownError: 3.");
            expect(Errors.stack({})).to.equal('UnknownError: {}.');
        });
        it('should handle circular objects', function(){
            var o = {};
            o.o = o;
            expect(Errors.stack(o)).to.equal('UnknownError: [object Object].');
        });
        it('should print out err.from error information', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var err = new Errors.TestError('from error');
            err = new Errors.TestError('wrapper error', err);
            
            expect(Errors.stack(err)).to.equal('TestError: wrapper error\n    ---\n    from: TestError: from error');
            
            require('../src/capture-stack.js')(Errors);
            
            err = new Errors.TestError('from error');
            err = new Errors.TestError('wrapper error', err);
            
            expect(Errors.stack(err)).to.match(/TestError: wrapper error.*(\r\n|\r|\n).*test-errors.js.*((\r\n|\r|\n).*)*---(\r\n|\r|\n)    from: TestError: from error.*(\r\n|\r|\n).*test-errors.js/);
        });
        
        it('should print out err.error error information', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var err = new Errors.TestError('first error');
            Errors.add(err, new Errors.TestError('another error'));
            
            expect(Errors.stack(err)).to.equal('TestError: first error\n    ---\n    additional error: TestError: another error');
            
            require('../src/capture-stack.js')(Errors);
            
            err = new Errors.TestError('first error');
            Errors.add(err, new Errors.TestError('another error'));
            
            expect(Errors.stack(err)).to.match(/TestError: first error.*(\r\n|\r|\n).*test-errors.js.*((\r\n|\r|\n).*)*---(\r\n|\r|\n)    additional error: TestError: another error.*(\r\n|\r|\n).*test-errors.js/);
        });
        
        it('should print out err.fields error information', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var err = new Errors.TestError('first error');
            Errors.add(err, 'test', new Errors.TestError('another error'));
            
            expect(Errors.stack(err)).to.equal('TestError: first error\n    ---\n    test: TestError: another error');
            
            require('../src/capture-stack.js')(Errors);
            
            err = new Errors.TestError('first error');
            Errors.add(err, 'test', new Errors.TestError('another error'));
            
            expect(Errors.stack(err)).to.match(/TestError: first error.*(\r\n|\r|\n).*test-errors.js.*((\r\n|\r|\n).*)*---(\r\n|\r|\n)    test: TestError: another error.*(\r\n|\r|\n).*test-errors.js/);
        });
        
        it('should print out additional error information', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var err = new Errors.TestError('first error', { test:123 });
            
            expect(Errors.stack(err)).to.equal('TestError: first error\n    ---\n    additional info: {\n        "test": 123\n    }');
            
            require('../src/capture-stack.js')(Errors);
            
            err = new Errors.TestError('first error', { test:123 });
            
            expect(Errors.stack(err)).to.match(/TestError: first error.*(\r\n|\r|\n).*test-errors.js.*((\r\n|\r|\n).*)*---(\r\n|\r|\n)    additional info: {(\r\n|\r|\n)        "test": 123(\r\n|\r|\n)    }$/);
        });
        
        it('should hanlde JSON.stringify errors when printing additional error information', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var o = {};
            o.o = o;
            
            var err = new Errors.TestError('test error', o);
            
            expect(Errors.stack(err)).to.equal('TestError: test error\n    ---\n    additional info error: Converting circular structure to JSON');
            
            require('../src/capture-stack.js')(Errors);
            
            err = new Errors.TestError('test error', o);
            
            expect(Errors.stack(err)).to.match(/TestError: test error.*(\r\n|\r|\n).*test-errors.js.*((\r\n|\r|\n).*)*---(\r\n|\r|\n)    additional info error: Converting circular structure to JSON/);
        });
        
        it('should respect the include_sub_errors flag', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var err = new Errors.TestError('test error');
            Errors.add(err, new Errors.TestError('additional error'));
            Errors.add(err, 'test', new Errors.TestError('test field error'));
            
            expect(Errors.stack(err, false)).to.equal('TestError: test error');
            
            require('../src/capture-stack.js')(Errors);
        });
        
        it('should work with all the values', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var addl = new Errors.TestError('additional error', 'additional additional', new Errors.TestError('from additional'));
            Errors.add(addl, new Errors.TestError('additional additional error'));
            Errors.add(addl, 'field', new Errors.TestError('additional field error'));
            
            var field = new Errors.TestError('field error', 'field additional', new Errors.TestError('from field'));
            Errors.add(field, new Errors.TestError('field additional error'));
            Errors.add(field, 'field', new Errors.TestError('field field error'));
            
            var err = new Errors.TestError('test error', 'additional info', new Errors.TestError('from'));
            Errors.add(err, addl);
            Errors.add(err, 'field', field);
            
            expect(Errors.stack(err)).to.equal("TestError: test error\n    ---\n    additional info: \"additional info\"\n    from: TestError: from\n    additional error: TestError: additional error\n        ---\n        additional info: \"additional additional\"\n        from: TestError: from additional\n    additional error: TestError: additional additional error\n    field: TestError: additional field error\n        ---\n        additional error: TestError: field error\n            ---\n            additional info: \"field additional\"\n            from: TestError: from field\n        additional error: TestError: field additional error\n    field.field: TestError: field field error");
        });
        
        it('should match the result of the inst.stack getter', function(){
            var Errors = require('../src/errors.js')();
            require('../src/inherits.js')(Errors);
            
            function TestError(){
                return TestError.init(this, arguments);
            }
            Errors.extend(TestError, 'TestError');
            
            var addl = new Errors.TestError('additional error', 'additional additional', new Errors.TestError('from additional'));
            Errors.add(addl, new Errors.TestError('additional additional error'));
            Errors.add(addl, 'field', new Errors.TestError('additional field error'));
            
            var field = new Errors.TestError('field error', 'field additional', new Errors.TestError('from field'));
            Errors.add(field, new Errors.TestError('field additional error'));
            Errors.add(field, 'field', new Errors.TestError('field field error'));
            
            var err = new Errors.TestError('test error', 'additional info', new Errors.TestError('from'));
            
            expect(Errors.stack(err)).to.equal(err.stack);
            
            Errors.add(err, 'field', field);
            Errors.add(err, addl);
            
            expect(Errors.stack(err)).to.equal(err.stack);
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
    
    describe('AuthError', function(){
        it('should return 401 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = new Errors.AuthError('auth message', { additional:'AuthError' }, new Error('test error'), 'AuthError');
            
            expect(Errors.AuthError.client_safe_messages).to.equal(true);
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.AuthError);
            expect(err.message).to.equal('auth message');
            expect(err.client_safe_message).to.equal('auth message');
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
            var err = new Errors.DevError('dev message', { additional:'DevError' }, new Error('test error'), 'DevError');
            
            expect(Errors.DevError.client_safe_messages).to.equal(false);
            
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
    
    describe('ServiceError', function(){
        it('should return 500 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = new Errors.ServiceError('http request error message', { additional:'ServiceError' }, new Error('test error'), 'ServiceError');
            
            expect(Errors.ServiceError.client_safe_messages).to.equal(true);
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.ServiceError);
            expect(err.message).to.equal('http request error message');
            expect(err.client_safe_message).to.equal('http request error message');
            expect(err.status_code).to.equal(500);
            expect(err.name).to.equal('ServiceError');
            expect(err.additional).to.deep.equal({ additional:'ServiceError' });
            expect(err.from).to.be.instanceof(Error, /^test error/);
            expect('' + err).to.equal('ServiceError: http request error message');
            expect(err.stack).to.match(/^ServiceError\: http request error message.*(\r\n|\r|\n).*test-errors.js/);
            expect(err.field).to.equal('ServiceError');
        });
    });
    
    describe('NotFoundError', function(){
        it('should return 404 and handle all arguments passed', function(){
            var Errors = require('../index.js')();
            var err = new Errors.NotFoundError('not found message', { additional:'NotFoundError' }, new Error('test error'), 'NotFoundError');
            
            expect(Errors.NotFoundError.client_safe_messages).to.equal(true);
            
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(Errors.NotFoundError);
            expect(err.message).to.equal('not found message');
            expect(err.client_safe_message).to.equal('not found message');
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
            var err = new Errors.NotifyUser('user message', { additional:'NotifyUser' }, new Error('test error'), 'NotifyUser');
            
            expect(Errors.NotifyUser.client_safe_messages).to.equal(true);
            
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
            var err = new Errors.UserError('notify user message', { additional:'UserError' }, new Error('test error'), 'UserError');
            
            expect(Errors.UserError.client_safe_messages).to.equal(true);
            
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
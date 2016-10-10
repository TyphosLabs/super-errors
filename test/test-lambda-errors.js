"use strict";

/*global describe:true, it:true*/

var Chai = require('chai');
var DirtyChai = require('dirty-chai');
var expect = Chai.expect;

Chai.use(DirtyChai);

var LambdaErrors = require('../index.js');
var UserError = LambdaErrors.UserError;

describe('LambdaErrors', function(){
    it('should pass through successes', function(){
        LambdaErrors(function(event, context, callback) {
            return callback(null, { success: true });
        })({}, {}, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.deep.equal({
                success: true
            });
        });
    });
    
    it('should pass error strings when there\'s an error', function(){
        LambdaErrors(function(event, context, callback) {
            return callback(new Error('Test error'));
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"There was an error.","name":"Error","status_code":500}');
            expect(result).to.equal(undefined);
        });
    });
    
    it('should pass error strings when there\'s an error', function(){
        LambdaErrors(function(event, context, callback) {
            return callback(LambdaErrors.ServerError('Test error'));
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"Server error occurred.","name":"ServerError","status_code":500}');
            expect(result).to.equal(undefined);
        });
    });
    
    it('should use a generic error if error value is not an object', function(){
        LambdaErrors(function(event, context, callback) {
            return callback("not an error value");
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"Invalid error value.","name":"DevError","status_code":500}');
            expect(result).to.equal(undefined);
        });
    });
    
    it('should pass any additional values attached to the error', function(){
        LambdaErrors(function(event, context, callback) {
            var err = UserError('parent error');
            LambdaErrors.add(err, UserError('child error'));
            LambdaErrors.add(err, UserError('2nd child error'));
            
            return callback(err);
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"parent error","name":"UserError","status_code":400,"errors":["child error","2nd child error"]}');
            expect(result).to.equal(undefined);
        });
    });
    
    it('should pass any additional field values attached to the error', function(){
        LambdaErrors(function(event, context, callback) {
            var err = UserError('parent error');
            LambdaErrors.add(err, 'a', UserError('child error'));
            LambdaErrors.add(err, 'b', UserError('2nd child error'));
            
            return callback(err);
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"parent error","name":"UserError","status_code":400,"fields":{"a":"child error","b":"2nd child error"}}');
            expect(result).to.equal(undefined);
        });
    });
    
    it('should default the error type to "Error"', function(){
        LambdaErrors(function(event, context, callback) {
            return callback({ safe_message:"Bad stuff happened."});
        })({}, {}, (err, result) => {
            expect(err).to.equal('{"message":"Bad stuff happened.","name":"Error","status_code":500}');
            expect(result).to.equal(undefined);
        });
    });
});
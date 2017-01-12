# SuperErrors

**TL;DR:** SuperErrors is like a condom for errors. Wrap your errors with a SuperError to provide friendly messages to clients while not exposing internal source code information.

## The Goal
1. Create any number of error types
2. Provide users with friendly error messages
3. Easily manage HTTP response codes
4. More information in stack
5. Prevent sensitive source code information from reaching the client
6. Allow multiple errors to be handled in a friendly way

## Typical Use Cases:
1. A rest API where it is important to send back relevant status codes and friendly user messages
2. A web application that still wants relevant status codes and friendly user messages
3. An API module. The `error.name` or `error.status_code` could be evaluated by an application to determine if there was an error or if the returned error message should be passed on to the user. This could be done recursively for all `error.fields` for things like validation where more than one error could have occurred.

### Example:
```javascript
var SuperErrors = require('super-errors')();

function UserNotification(message, additional, from_error, field){
    this.init(UserNotification, message, additional, from_error, field);
}
Errors.create(UserNotification, 'UserNotification', 'An error occurred. Please try again.', 500, true);

...

db.users.insert(data, function(err, result){
    if(err){
        return callback(new UserNotification('Could not create user.', err));
    }
    callback(null, result);
}
```
If the database insert resulted in something like `DatabaseError: could not insert "josh" into "users" database.`, the callback would receive an error that looked something like:

```javascript
{
    name: "UserNotification",
    message: "Could not create user.",
    status_code: 400,
    from: { // Error from the database
        message: 'DatabaseError: could not insert "josh" into "users" database.',
        stack: 'DatabaseError: could...'
    },
    stack: 'UserNotification: Could not create user.\n    at main.js (/test/main.js:23:8)\n    ---\n    from: DatabaseError: could not insert "josh" into "users" database.\n    ...'
}
```

## Creating a New Error Type:

To create a brand new error type for you application or module, use `SuperErrors.create()`. 

#### SuperErrors.create(constructor, name, default_message, status_code, client_safe_messages)
- **constructor** (_function_): Should be the constructor function for this error.
- **name** (_string_): Should be the name for the error (ex: `AuthError`, `NotifyUser`, etc).
- **default_message** (_string_): The default message to use when no message is passed or `client_safe_messages` is set to false.
- **status_code** (_int_): We recommend a HTML status code value be used here but it could be any value you want.
- **client_safe_messages** (_boolean_): Whether or not instances of this error should have `.client_safe_message` set to the default message (false) or the instance message (true). Defaults to false.

##### custom error example:
```javascript
var Errors = require('super-errors')();

function MyError(message, additional, from_error, field){
    this.init(MyError, message, additional, from_error, field);
}
Errors.create(MyError, 'MyError', 'My stuff broke. Sorry! :(', 500, true);

throw new MyError('Testing...');
```

## Handling an Error Responsibly:

Because we cannot ensure that the error message from another module is safe and will always be safe (especially modules that have external api keys or handle sensitive user information), we want to only ever send back the error type, a client-safe message, and the status code. This is where SuperErrors really helps you out. If you use Express.js, you could accomplish these goals by using an error handler like this:

```javascript
function handleErrors(req, res, next, err){
    console.error(err.stack);
    
    var status = err.status || 500;
    var name = err.name || 'Error';
    var message = err.client_safe_message || 'There was an error.';
    
    res.status(status).send(name + ': ' + message);
}
```

This does several things for you:
1. Prints out the stack where your custom error was created (letting you know where your code was when the failure happened) as well as the stack of the original error.
2. Defaults the HTTP status code to 500 but will use `err.status_code` if set.
3. Returns the name of the error.
4. Returns the client_safe_message set by the `this.init()` call inside of the constructor or defaults to 'There was an error.' if the error does not have a `client_safe_message` (which will likely be all errors you didn't wrap).

It is easy to return json values as well:
```javascript
function handleErrors(req, res, next, err){
    console.error(err.stack);
    
    var status = err.status || 500;
    var name = err.name || 'Error';
    var message = err.client_safe_message || 'There was an error.';
    
    res.status(status).json({
        name: name,
        message: message,
        status_code: status
    });
}
```

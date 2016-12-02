# Super Errors

The goal of Super Errors is to make errors more helpful and much simpler to use while not exposing sensitive information. We accomplish this in two ways: 1) by having more arguments in our Error constructor and 2) by adding a client_safe_message property to our errors.

Say you have a naughty error that would normally have a message that looked like this:

```javascript
"Cannot insert into sensitive_table. Record { user:'josh', password:'lordvader' } already exists."
```

Obviously, we really do not want to send that back to our users. At this point, we have two options: either tear into the developer that created this error and hope they change their ways or never send back errors we haven't created. We don't think tearing into other developers is a good idea and what they sent was some pretty good debug information. So how do we protect ourselves? Put a wrapper on it!

Typically, an error like this would come from code that might look like this:

```javascript
db.insert(data, function(err, result){
    if(err){
        return callback(err);
    }
    callback(null, result);
}
```

Instead, lets protect ourselves by wrapping the returned error:

```javascript
var Errors = require('super-errors');
...
db.insert(data, function(err, result){
    if(err){
        return callback(Errors.NotifyUser('Could not create user.', err));
    }
    callback(null, result);
}
```

Your error object will now look something like:

```javascript
{
    message: "Could not create user.",
    client_safe_message: "Could not create user.",
    status_code: 500,
    from_error: {
        message: "Cannot insert into sensitive_table. Record { user:'josh', password:'lordvader' } already exists.",
        stack: "Error: Cannot insert into sensitive_table. Record { user:'josh', password:'lordvader' } already exists. ..."
    },
    stack: "NotifyUser: Could not create user. ..."
}
```

Now, obviously, you would *not* want to just `JSON.stringify()` that and send it back to the user. But, if your error handler looked something like the following, you would be in pretty good shape:

```javascript
function clientSafeError(err){
    console.error(err.stack);
    return {
        message: err.client_safe_message || "There was an error.",
        status_code: err.status_code || 500
    };
}
```

That simple error handler does a lot for you. First, the safe message and http status code are sent back to the user providing a much more friendly and helpful user experience. Second, if an unknown error slips through the cracks, the user will get a 500 with `There was an error.` as the message instead of potentially sensitive information. And third, you get all the sexy information you want to know in your logs.

What sexy information is in the logs, you ask? Let me show you:

```
NotifyUser: Could not create user
    at createUser (sexy-web-app.js:100:4)
    at handleRequest (sexy-web-app.js:40:12)
    -----
    from: Error: Cannot insert into sensitive_table. Record { user:'josh', password:'lordvader' } already exists.
        at sendRequest (db.js:120:16)
        at dbInsert (db.js:60:8)
        at createUser (sexy-web-app.js:98:4)
        at handleRequest (sexy-web-app.js:40:12)
```

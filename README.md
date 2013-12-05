# SalesForce client for Nodejs
This node module provides a set of methods to interact against SalesForce's services.
The module was created as part of [KidoZen](http://www.kidozen.com) project, as a connector for its Enterprise API feature.

## Installation

Use npm to install the module:

```
> npm install salesforce-api
```

## API

Due to the asynchrounous nature of Nodejs, this module uses callbacks in requests. All callbacks have 2 arguments: `err` and `data`.

```
function callback (err, data) {
	// err contains an Error class instance, if any
	// data contains the resulting data
} 
``` 


### Authentication

The module exports a Class and its constructor requires a configuration object with following properties

* `username`: Required string. End-user’s username.
* `password`: Required string. End-user’s password.

```
var SalesForce = require("salesforce-api");
var salesforce = new SalesForce({
        username: "account@kidozen.com",
        password: "secret"
    });
```

#### UserName and Password login

The module exports a Class and its constructor requires a configuration object with following properties

* `username`: Required string. End-user’s username.
* `password`: Required string. End-user’s password.

```
var SalesForce = require("salesforce-api");
var salesforce = new SalesForce();
salesforce.authenticate({
        username: "account@kidozen.com",
        password: "secret"
    }, ...
```

#### Username and Password Login (OAuth2 Resource Owner Password Credential)

When OAuth2 client information is given to ctor. authenticate(username, password) uses OAuth2 Resource Owner Password Credential flow to login to Salesforce.

```
var SalesForce = require("salesforce-api");
var salesforce = new SalesForce();
salesforce.authenticate({
        username: "account@kidozen.com",
        password: "secret",
        oauth2 : {
            clientId : '...',
            clientSecret : '...',
            redirectUri : 'https://login.salesforce.com/services/oauth2/token'
        }
    }, ...

```


#### Access Token

After the authenticate API call, you can get Salesforce access token and its instance URL. Next time you can use them to establish connection.

```
var OAUTH2SessionInfo = {
      	instanceUrl : '<your Salesforce server URL (e.g. https://na1.salesforce.com) is here>',
      	accessToken : '<your Salesforce session ID is here>'
   		// you can find this values in the result of authenticate method
    };

var query = {
    credentials : OAUTH2SessionInfo,
    SOSQL: "SELECT Id from Account"
};

api.Query(query, function(err, result) {
	...
	...
	...

```


### Methods
All public methods has the same signature, their have two arguments: `options` and `callback`.
* `options` must be an object instance containig all parameters for the method.
* `callback` must be a function.

#### describe(options, callback)

This method should be used to retrieve metadata for an object.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Optional string.
* `callback`: A required function for callback.


```
salesforce.describe({ objectClass:"Account" }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### DescribeGlobal(options, callback)

This method returns all SObject information registered in Salesforce

**Parameters:**
* `callback`: A required function for callback.


```
salesforce.DescribeGlobal(function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### SOSQL Query(options, callback)

Use this method to execute a SOQL query that returns all the results in a single response, or if needed, returns part of the results and an identifier used to retrieve the remaining results.

**Parameters:**
* `options`: A required object instance:
	* `SOSQL`: Required string.
* `callback`: A required function for callback.


```
salesforce.Query({ SOSQL: "SELECT Id, Name, BillingCity FROM Account" }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```
#### Json Query(options, callback)

Use this method to execute a SOQL query that returns all the results in a single response, or if needed, returns part of the results and an identifier used to retrieve the remaining results.

**Parameters:**
* `options`: A required object instance:
	* `Entity`: Required string.
	* `Conditions`: Required string.
	* `Fields`: Required string.
	* `Options`: Required string.
* `callback`: A required function for callback.


```
var query = {
                Entity: "Account",
                Conditions : { 
                    Name : { $like : 'G%' }
                },
                Fields : {
                    Id: 1,
                    Name: 1,
                    CreatedDate: 1 
                },
                Options : { 
                    Limit : 5,
                    Skip: 10
                }
            };
salesforce.Query(query, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```


#### Create(options, callback)

This method allows you to create a new record. You have to supply the required field values of the resource.

**Parameters:**
* `options`: A required object instance:
	* `Entity`: Required string.
	* `Details`: Required object instance
* `callback`: A required function for callback.

The following example creates a new Account record:

```
var newAccount = { Name: "Foo account" };
salesforce.Create({ Entity: "Account",  Details: newAccount }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### Update(options, callback)

Use this method to update records. Provide the updated record information at the `data` property.

**Parameters:**
* `options`: A required object instance:
	* `Entity`: Required string.
	* `Details`: Required object. Updated record. It must have the `id` property with the object id to update
* `callback`: A required function for callback.

In the following example, the Billing City within an Account is update.

```
var options = {
	Entity: "Account",
	Details : 
		{
			id: "CD656092",
			BillingCity: "San Francisco" 
		}
	}
};

salesforce.Update(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### Upsert(options, callback)

Will upsert a record or records given in first argument. External ID field name must be specified in second argument.

**Parameters:**
* `options`: A required object instance:
	* `Entity`: Required string.
	* `Details`: Required object. Updated record. It must have the `ExtId__c` property with the object id to update
	* `ExternalIdName` the field id name
* `callback`: A required function for callback.

```
var options = {
	Entity: "UpsertTable__c",
	Details : 
		{
			Name : 'Record #1',
  			ExtId__c : 'ID-0000001'
  		},
	ExternalIdName : 'ExtId__c'
	}
};

salesforce.Upsert(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### Delete(options, callback)

Use this method to delete an existing record.

**Parameters:**
* `options`: A required object instance:
	* `Entity`: Required string.
	* `Details`: Required, string or array of strings with the ids to delete
* `callback`: A required function for callback.

In the following example removes the record the ID 1234 from Account

```
var options = {
	Entity: "Account",
	Details: "1234"
};

salesforce.Delete(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```
or

```
var options = {
	Entity: "Account",
	Details: ["1234","012"]
};

salesforce.Delete(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```



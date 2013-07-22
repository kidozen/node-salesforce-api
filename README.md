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

### Constructor

The module exports a Class and its constructor requires a configuration object with following properties

* `credential`: Required string.
* `username`: Required string. End-user’s username.
* `password`: Required string. End-user’s password.
* `clientId`: Required string. The Consumer Key from the remote access application definition.
* `clientSecret`: Required stringThe Consumer Secret from the remote access application definition.
* `loginHost`: Optional string. Default value is 'login.salesforce.com'
* `timeout`: Optional integer for the session timeout in milleseconds. Default 15 minutes.  

```
var SalesForce = require("salesforce-api");
var salesforce = new SendGrid({ 
	credential: "...",
	username: "...",
	password: "...",
	clientId: "...",
	clientSecret: "...",
	timeout: 5*60*1000	// Timeout of 5 minutes
});
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

#### queryObjects(options, callback)

Use this method to execute a SOQL query that returns all the results in a single response, or if needed, returns part of the results and an identifier used to retrieve the remaining results.

**Parameters:**
* `options`: A required object instance:
	* `query`: Required string.
* `callback`: A required function for callback.


```
salesforce.query({ query: "SELECT Id, Name, BillingCity FROM Account" }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### searchObjects(options, callback)

Use this method to execute a SOSL search.

**Parameters:**
* `options`: A required object instance:
	* `query`: Required string.
* `callback`: A required function for callback.

The following example executes a SOSL search for {test}:

```
salesforce.searchObjects({ query:"FIND {test}" }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### createObject(options, callback)

This method allows you to create a new record. You have to supply the required field values of the resource.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `object`: Required object instance
* `callback`: A required function for callback.

The following example creates a new Account record:

```
var newAccount = { Name: "Foo account" };
salesforce.createObject({ objectClass: "Account",  object: newAccount }, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### fetchObject(options, callback)

This method should be used to retrieve an object by its ID.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `id`: Required string.
	* `fields`: Optional. It could be a string containing field names separated by comma or an array of strings.
* `callback`: A required function for callback.


```
var options = {
	objectClass: "Account",
	id: "CD656092",
	fields: "AccountNumber,BillingPostalCode"
};

salesforce.fetchObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```


#### updateObject(options, callback)

Use this method to update records. Provide the updated record information at the `data` property.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `id`: Required string.
	* `data`: Required object. Updated record.
* `callback`: A required function for callback.

In the following example, the Billing City within an Account is update.

```
var options = {
	objectClass: "Account",
	id: "CD656092",
	data: { BillingCity: "San Francisco" }
};

salesforce.updateObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### upsertObject(options, callback)

You can use this method to create new records or update existing records (upsert) based on the value of a field.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `id`: Required string.
	* `data`: Required object. Updated record.
* `callback`: A required function for callback.

```
var options = {
	objectClass: "Account",
	indexField: "otherField"
	data: { BillingCity: "San Francisco", otherField: "foo" }
};

salesforce.upsertObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```


#### deleteObject(options, callback)

Use this method to delete an existing record.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `id`: Required string.
* `callback`: A required function for callback.

In the following example removes the record the ID 1234 from Account

```
var options = {
	objectClass: "Account",
	id: "1234"
};

salesforce.deleteObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### fetchExternalObject(options, callback)

use this method to retrieve an object with a specific External ID

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `indexField`: Required string.
	* `indexValue`: Required string. 
* `callback`: A required function for callback.

The following example assumes there is a Merchandise__c custom object with a MerchandiseExtID__c external ID field.

```
var options = {
	objectClass: "Merchandise__c",
	indexField: "MerchandiseExtID__c",
	indexValue: "1245"
};

salesforce.fetchExternalObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```


#### updateExternalObject(options, callback)

Updates an object by a specific External ID

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `indexField`: Required string.
	* `data`: Required object. Updated record.
* `callback`: A required function for callback.

In the following example, will update the Account record that contains the field fooExtID__c and its value is equal 1234

```
var options = {
	objectClass: "Account",
	indexField: "fooExtID__c",
	data: { BillingCity: "San Francisco", fooExtID__c: 1234 }
};

salesforce.updateExternalObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

#### upsertExternalObject(options, callback)

You can use this method to create new records or update existing records (upsert) based on the value of an External ID.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `indexField`: Required string.
	* `data`: Required object.
* `callback`: A required function for callback.

```
var options = {
	objectClass: "Account",
	indexField: "fooExtID__c",
	data: { BillingCity: "San Francisco", fooExtID__c: 1234 }
};

salesforce.upsertExternalObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```


#### deleteObject(options, callback)

Use this method to delete an existing records by an External ID.

**Parameters:**
* `options`: A required object instance:
	* `objectClass`: Required string.
	* `indexField`: Required string.
	* `indexValue`: Required.
* `callback`: A required function for callback.

In the following example removes the record the ID 1234 from Account

```
var options = {
	objectClass: "Account",
	indexField: "fooExtID__c",
	indexValue: "1245"
};

salesforce.deleteExternalObject(options, function(err, result) {
	if (err) return console.error (err);
	console.log (result);
});
```

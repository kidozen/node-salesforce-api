/*
* Module's dependencies
*/
var SF      = require("salesforce");
var Cache   = require("mem-cache");

/**
 * Salesforce class
 * Handles invocations to Salesforce's methods.
 * @param config {object} required
 *  - credential:   {string} required.
 *  - username:     {string} required. 
 *  - password:     {string} required.
 *  - clientId:     {string} required.
 *  - clientSecret: {string} required.
 *  - loginHost:    {string} optional. Default login.salesforce.com
 *  - timeout:      {number} optional. Session timeout in seconds. Default 15 minutes.
 * @returns {Salesforce}
 * @api public
 */
var Salesforce = function(config) {

    // validations
    if (!config || typeof config !== 'object') throw new Error("'config' argument must be an object instance.");
    if (!config.credential      || typeof config.credential !== 'string')   throw new Error("'config.credential' property is missing or invalid.");
    if (!config.username        || typeof config.username !== 'string')     throw new Error("'config.username' property is missing or invalid.");
    if (!config.password        || typeof config.password !== 'string')     throw new Error("'config.password' property is missing or invalid.");
    if (!config.clientId        || typeof config.clientId !== 'string')     throw new Error("'config.clientId' property is missing or invalid.");
    if (!config.clientSecret    || typeof config.clientSecret !== 'string') throw new Error("'config.clientSecret' property is missing or invalid.");
    if (config.loginHost        && typeof config.loginHost !== 'string')    throw new Error("'config.loginHost' property must be an string.");
    if (config.timeout          && typeof config.timeout !== 'number')      throw new Error("'config.timeout' property must be a number.");

    // keeps a reference to the configuration.
    var globalConfig = just(config, "username", "password", "clientId", "clientSecret", "credential"); 
    globalConfig.loginHost  = config.loginHost  || "login.salesforce.com";
    globalConfig.timeout  = config.timeout  || 15 * 60; 

    Object.defineProperty(this, "config", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: globalConfig
    });

    // cache that holds active sessions
    var sessions = new Cache({ timeout: globalConfig.timeout * 1000});

    this.describe = function(options, cb) {
        invoke("describe", { objectClass:false }, options, cb);
    };

    this.queryObjects = function(options, cb) {
        invoke("queryObjects", { query: true }, options, cb);
    };

    this.searchObjects = function(options, cb) {
        invoke("searchObjects", { query: true }, options, cb);
    };

    this.createObject = function(options, cb) {
        invoke("createObject", { objectClass: true, object: true }, options, cb);
    };

    this.fetchObject = function(options, cb) {
        invoke("fetchObject", { objectClass: true, id: true, fields: false }, options, cb);
    };

    this.updateObject = function(options, cb) {
        invoke("updateObject", { objectClass: true, id: true, data: true }, options, cb);
    };

    this.upsertObject = function(options, cb) {
        invoke("upsertObject", { objectClass: true, data: true, indexField: true }, options, cb);
    };

    this.deleteObject = function(options, cb) {
        invoke("deleteObject", { objectClass: true, id: true }, options, cb);
    };

    this.fetchExternalObject = function(options, cb) {
        invoke("fetchExternalObject", { objectClass: true, indexField: true, indexValue: true }, options, cb);
    };

    this.updateExternalObject = function(options, cb) {
        invoke("updateExternalObject", { objectClass: true, data: true, indexField: true }, options, cb);
    };

    this.upsertExternalObject = function(options, cb) {
        invoke("upsertExternalObject", { objectClass: true, indexField: true, indexValue: true }, options, cb);
    };

    this.deleteExternalObject = function(options, cb) {
        invoke("deleteExternalObject", { objectClass: true, indexField: true, indexValue: true }, options, cb);
    };

    this.createAttachment = function(options, cb) {
        invoke("createAttachment", { parentId: true, name: true, content: true, type: true }, options, cb);
    };

    this.attachFile = function(options, cb) {
        invoke("attachFile", { parentId: true, filename: true, type: false }, options, cb);
    };

    this.attachBuffer = function(options, cb) {
        invoke("attachBuffer", { parentId: true, name: true, content: true, type: true }, options, cb);
    };

    this.fetchBlobField = function(options, cb) {
        invoke("fetchBlobField", { objectClass: true, id: true, field: true }, options, cb);
    };

    // invokes a salesforce REST API 
    var invoke = function(name, info, options, cb) {

        // default arguments
        if (!cb && typeof options === 'function') {
            cb = options;
            options = {};
        }

        // validates arguments
        if (!cb || typeof cb !== 'function') throw "Callback argument must be a function.";
        if (!options || typeof options !== 'object') return cb(new Error("'options' argument must be an object instance."));

        // get session from cache
        var session = getSession(options);

        // builds method's argument array
        var fieldNames = Object.keys(info);
        var args = [];
        for (var index in fieldNames) {
            var fieldName = fieldNames[index],
                fieldValue = options[fieldName];

            // validate required fields
            if (info[fieldName] && fieldValue === undefined) return cb(new Error("Option's property '" + fieldName + "' is required."));
            
            // add value to method's argument array 
            args.push(fieldValue);
        }

        // adds callback function as last argument
        args.push(cb);

        // invokes the method
        try {            
            session[name].apply(session, args);
        }   
        catch (e) {
            cb(new Error("Couldn't invoke method '" + name + "'. " + (typeof e === "string") ? e : JSON.stringify(e)));
        }
    };

    // returns a session from the cache or creates a new one
    var getSession = function (options) {
        var config = merge(globalConfig, options); 
        var key = getSessionKey(config);
        
        var session = sessions.get(key);
        if (!session) {
            session = new SF(just(config, "credential", "username", "password", "clientId", "clientSecret", "loginHost"));
            sessions.set(key, session);
        }

        return session;
    };

    // build cache's key for a session
    var getSessionKey = function (options) {
        return config.clientId + "|" + 
            config.loginHost + "|" +
            config.username + "|" + 
            config.password;
    };
};

module.exports = Salesforce;

// returns a new object containg all the properties from all objects passed as argument
// by instance: 
// merge( {a:1, b:2 }, {b:3, c:4 }) returns { a:1, b:3, c:4 }
var merge = function() {

    var result = {};
    var ak;

    for(ak in arguments) {
        var from = arguments[ak];
        var props = Object.getOwnPropertyNames(from);
        props.forEach( function (name) {
            var destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(result, name, destination);
        });
    }

    return result;
};

// returns a new object containing just the properties from source passed as string arguments
// by instance: 
// just( {a:1, b:2, c:3, d:4}, "b", "c") returns { b:2, c:3 }
var just = function (source) {

    var result  = {};
    var args    = Array.prototype.slice.call(arguments, 0);
    var index;
    var prop;

    for (index = 1; index < args.length; index++) {
        prop = args[index]; 
        result[prop] = source[prop];
    }
    return result;
};

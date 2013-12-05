/*
* Module's dependencies
*/
var SF      = require('node-salesforce');
var Cache   = require("mem-cache");
var uuid    = require("node-uuid");

var Salesforce = function(settings) {
    // Initialize members
    var self    = this;
    var config  = settings;
    var cacheTimeout =  (!settings || !settings.timeout ) ? 15 * 60 * 1000 : settings.timeout; // 15 minutes in milliseconds

    var cacheOptions = {timeout: cacheTimeout};

    Object.defineProperty(this, "cacheAuth", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new Cache(cacheOptions)
    });

    var cacheUser = new Cache(cacheOptions);

    this.authenticate = function (credentials, cb) {
        // defaults for credentials
        credentials = credentials || config;
        if (!cb && typeof credentials === 'function') {
            cb = credentials;
            credentials = config;
        }

        // defaults for cb
        cb = cb || function(err) { if(err) throw err; };
        if (typeof cb !== 'function') return cb(new Error("'cb' argument is invalid."));
        if (!credentials || typeof credentials !== 'object') return  cb(new Error("'credentials' argument is invalid."));

        var account;
        var secret;
        var sfConnection = new SF.Connection(); 

        if (credentials.oauth2 && typeof credentials.oauth2 == 'object') {
            if (typeof (credentials.oauth2.clientId) !== 'string') return cb(new Error("'oauth2.clientId' property is invalid."));
            if (typeof (credentials.oauth2.clientSecret) !== 'string') return cb(new Error("'oauth2.clientSecret' property is invalid."));
            sfConnection = new SF.Connection(credentials.oauth2); 
        }

        // Validates user credentials
        if (!credentials.username || typeof (credentials.username) !== 'string') return cb(new Error("'username' property is missing or invalid."));
        if (!credentials.password || typeof (credentials.password) !== 'string') return cb(new Error("'password' property is missing or invalid."));

        account = credentials.username || config.username; 
        secret = credentials.password || config.password;           

        var auth = cacheUser.get(account);
        if (auth) {
            var item = self.cacheAuth.get(auth);
            if (item && item.password === secret) return cb(null, item.connection);
        }

        sfConnection.login(account, secret, function(error, userInfo) {
            if (error) {
                return cb(error,null);
            };
            
            var auth = uuid.v4(); // Internal auth token 
            var item = {
                username: account,
                password: secret,
                connection  : sfConnection
            };

            self.cacheAuth.set(auth, item);  
            cacheUser.set(account, auth);

            cb(null, sfConnection);
        });
    };

    var getSFCnnFromCache = function (args, cb) {
        if (args.credentials) {
            if (args.credentials.instanceUrl)  return cb(null, new SF.Connection(args.credentials));
        };          
        self.authenticate(args.credentials, cb);
    };

    this.Query = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            if (options.SOSQL) {
                item.query(options.SOSQL, function(err, result) {
                    return cb(err, result);
                });
            };
            item.sobject(options.Entity)
                .find(options.Conditions, options.Fields, options.Options, function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.Describe = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.sobject(options.objectClass).describe(function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.DescribeGlobal = function(cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.describeGlobal(function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.Create = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.sobject(options.Entity)
                .create(options.Details, function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.Update = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.sobject(options.Entity)
                .update(options.Details, function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.Upsert = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.sobject(options.Entity)
                .upsert(options.Details, options.ExternalIdName, function(err, result) {
                    return cb(err, result);
            });
        });
    };

    this.Delete = function(options, cb) {
        getSFCnnFromCache(options, function(err, item) {
            item.sobject(options.Entity)
                .destroy(options.Details, function(err, result) {
                    return cb(err, result);
            });
        });
    };


};

module.exports = Salesforce;

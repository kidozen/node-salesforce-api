/*
* Module's dependencies
*/
var SF      = require('node-salesforce');
var Cache   = require("mem-cache");
var uuid    = require("node-uuid");
var request = require('request');
var jwtflow = require('./jwtflow.js');

var Salesforce = function(settings) {
    // Initialize members
    var self    = this;
    var config  = settings;
    var cacheTimeout =  (!settings || !settings.timeout ) ? 15 * 60 * 1000 : settings.timeout; // 15 minutes in milliseconds
    var isSandbox = (config && config.isSandbox);

    var cacheOptions = {timeout: cacheTimeout};

    Object.defineProperty(this, "cacheAuth", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new Cache(cacheOptions)
    });

    var cacheUser = new Cache(cacheOptions);

    this.authenticate = function (credentials, cb) {

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
        var sfConnection;

        if (isSandbox) {
            sfConnection = new SF.Connection({ loginUrl: 'https://test.salesforce.com' });
        } else {
            sfConnection = new SF.Connection();
        }

        if (credentials.useOAuthJwtFlow) {

            if (!credentials.privateKey) {
                cb(new Error('credentials.privateKey is required when using OAuth JWT Bearer Flow.'));
                return;
            };

            if (!credentials.clientId) {
                cb(new Error('credentials.clientId is required when using OAuth JWT Bearer Flow.'));
                return;
            };

            if (!credentials.actAsUsername) {
                cb(new Error('credentials.username is required when using OAuth JWT Bearer Flow.'));
                return;
            };

            jwtflow(credentials.clientId, credentials.privateKey, credentials.actAsUsername, isSandbox, function(err, accessToken) {
                if (err) {
                    cb(err);
                    return;
                }

                sfConnection = new SF.Connection();

                sfConnection.initialize({
                  instanceUrl: 'https://' + credentials.loginHost,
                  accessToken: accessToken
                });

                cb(null, sfConnection);
                return;
            });

            return;
        };

        if (credentials.oauth2 && typeof credentials.oauth2 == 'object') {
            if (typeof (credentials.oauth2.clientSecret) !== 'string') return cb(new Error("'oauth2.clientSecret' property is invalid."));
            
            if (isSandbox) {
                sfConnection = new SF.Connection({ oauth2: credentials.oauth2, loginUrl: 'https://test.salesforce.com' });
            } else {
                sfConnection = new SF.Connection(credentials.oauth2);
            }
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
                connection: sfConnection
            };

            self.cacheAuth.set(auth, item);  
            cacheUser.set(account, auth);

            cb(null, sfConnection);
        });
    };

    var getSFConnection = function (options, cb) {

        // defaults for credentials
        var credentials = options.credentials || config;
        var metadata = options._kidozen || options.metadata;

        if (metadata && metadata.userClaims) {
            var claimType = credentials.userNameClaimType || 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
            
            credentials.actAsUsername = (metadata.userClaims.filter(function(c) { 
                return c.type == claimType; 
            })[0] || {}).value;

            if (!credentials.actAsUsername) {
                cb(new Error('Claim type "' + claimType + '" was not found in user claims.'));
                return;
            };
        }

        self.authenticate(credentials, cb);
    };

    this.Query = function(options, cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

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
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.sobject(options.objectClass).describe(function(err, result) {
                return cb(err, result);
            });
        });
    };

    this.DescribeGlobal = function(cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.describeGlobal(function(err, result) {
                return cb(err, result);
            });
        });
    };

    this.Create = function(options, cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.sobject(options.Entity)
            .create(options.Details, function(err, result) {
                return cb(err, result);
            });
        });
    };

    this.Update = function(options, cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.sobject(options.Entity)
            .update(options.Details, function(err, result) {
                return cb(err, result);
            });
        });
    };

    this.Upsert = function(options, cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.sobject(options.Entity)
            .upsert(options.Details, options.ExternalIdName, function(err, result) {
                return cb(err, result);
            });
        });
    };

    this.Delete = function(options, cb) {
        getSFConnection(options, function(err, item) {
            if (err) { return cb(err); };

            item.sobject(options.Entity)
            .destroy(options.Details, function(err, result) {
                return cb(err, result);
            });
        });
    };
};

module.exports = Salesforce;

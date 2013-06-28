var assert  = require("assert");
var nock    = require("nock");
var API     = require("../index.js");

describe("salesforce API", function () {

    var config = null;

    beforeEach( function (done) {
        config = { 
            credential: 'cred',
            username: 'user',
            password: 'pwd', 
            clientId: 'id', 
            clientSecret: 'secret', 
            loginHost: 'host'
        };
        done();
    });

    describe("constructor", function () {
        it("should throw if no config", function ( done ) {
            try {
                new API();
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config'") > -1);
                done();
            }
        });

        it("should throw if no credential was passed into config", function ( done ) {
            try {
                new API( {});
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.credential'") > -1);
                done();
            }
        });

        it("should throw if invalid credential was passed into config", function ( done ) {
            try {
                new API( { credential: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.credential'") > -1);
                done();
            }
        });

        it("should throw if no username was passed into config", function ( done ) {
            try {
                new API( { credential: "foo"} );
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.username'") > -1);
                done();
            }
        });

        it("should throw if invalid username was passed into config", function ( done ) {
            try {
                new API( { credential: "foo", username: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.username'") > -1);
                done();
            }
        });

        it("should throw if no password was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user" } );
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.password'") > -1);
                done();
            }
        });

        it("should throw if invalid password was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.password'") > -1);
                done();
            }
        });

        it("should throw if no clientId was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass" } );
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.clientId'") > -1);
                done();
            }
        });

        it("should throw if invalid clientId was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass", clientId: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.clientId'") > -1);
                done();
            }
        });

        it("should throw if no clientSecret was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass", clientId: "id" } );
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.clientSecret'") > -1);
                done();
            }
        });

        it("should throw if invalid clientSecret was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass", clientId: "id", clientSecret: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.clientSecret'") > -1);
                done();
            }
        });

        it("should throw if invalid loginHost was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass", clientId: "id", clientSecret: "secret", loginHost: 1 });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.loginHost'") > -1);
                done();
            }
        });

        it("should throw if invalid timeout was passed into config", function ( done ) {
            try {
                new API( { credential: "cred", username: "user", password: "pass", clientId: "id", clientSecret: "secret", timeout: "invalid value" });
                throw new Error ("Had to be thrown")
            } catch ( e ) {
                assert.ok(e);
                assert.ok(e instanceof Error);
                assert.ok(e.message.indexOf("'config.timeout'") > -1);
                done();
            }
        });

        it("should be able to ceate an instance", function ( done ) {
            var api = new API({ credential: "cred", username: "user", password: "pass", clientId: "id", clientSecret: "secret", loginHost: "host", timeout: 10 });
            assert.ok(api instanceof API);
            assert.equal("cred", api.config.credential);
            assert.equal("user", api.config.username);
            assert.equal("pass", api.config.password);
            assert.equal("id", api.config.clientId);
            assert.equal("secret", api.config.clientSecret);
            assert.equal("host", api.config.loginHost);
            assert.equal(10, api.config.timeout);
            done(); 
        });

        it("should be able to ceate an instance using default values", function ( done ) {
            var api = new API({ credential: "cred", username: "user", password: "pass", clientId: "id", clientSecret: "secret"});
            assert.ok(api instanceof API);
            assert.equal("cred", api.config.credential);
            assert.equal("user", api.config.username);
            assert.equal("pass", api.config.password);
            assert.equal("id", api.config.clientId);
            assert.equal("secret", api.config.clientSecret);
            assert.equal("login.salesforce.com", api.config.loginHost);
            assert.equal(15 * 60, api.config.timeout);
            done(); 
        });
    });

    it("should invoke a method", function ( done ) {

        var login = nock("https://host")
            .post("/services/oauth2/token?grant_type=password&client_id=id&client_secret=secret&username=user&password=pwdcred&format=json")
            .reply(200, {
                id          : "loginId",
                issued_at   : parseInt(new Date().getTime() / 1000),
                instance_url: "https://loginInstanceUrl",
                signature   : "loginSignature",
                access_token: "loginAccessToken"
            });

        var service = nock("https://loginInstanceUrl")
            .defaultReplyHeaders({'Content-Type': 'application/json'})
            .get("/services/data/v25.0/query?q=foo")
            .reply(200, {
                done        : true,
                totalSize   : 2,
                records     : [
                    { Id: "01", Name: "Test 1", attributes: { type: "Account", url: "/services/data/v20.0/sobjects/Account/001D000000IRFmaIAH" } },
                    { Id: "02", Name: "Test 2", attributes: { type: "Account", url: "/services/data/v20.0/sobjects/Account/001D000000IomazIAB" } }
                ]
            });

        var api = new API(config);
        var method = api.queryObjects;
        assert.ok(method);
        method({ query: "foo" }, function(err, result) {
            assert.ok(!err);
            assert.ok(result);
            assert.ok(result.done);
            assert.equal(2, result.totalSize);
            assert.ok(result.records instanceof Array);
            assert.equal(2, result.records.length);

            // validates expectations
            login.done();
            service.done();

            done();
        });
    });

    it("should use cached session when invokes a second method", function ( done ) {

        var login = nock("https://host")
            .post("/services/oauth2/token?grant_type=password&client_id=id&client_secret=secret&username=user&password=pwdcred&format=json")
            .reply(200, {
                id          : "loginId",
                issued_at   : parseInt(new Date().getTime() / 1000),
                instance_url: "https://loginInstanceUrl",
                signature   : "loginSignature",
                access_token: "loginAccessToken"
            });

        var service = nock("https://loginInstanceUrl")
            .defaultReplyHeaders({'Content-Type': 'application/json'})
            .get("/services/data/v25.0/query?q=foo")
            .reply(200, {
                done        : true,
                totalSize   : 1,
                records     : [ { Id: "01", Name: "Test 1", attributes: { type: "Account", url: "/foo/account" } } ]
            })
            .get("/services/data/v25.0/query?q=bar")
            .reply(200, {
                done        : true,
                totalSize   : 1,
                records     : [ { Id: "02", Name: "Test 2", attributes: { type: "Order", url: "/foo/order" } } ]
            });

        var api = new API(config);
        var method = api.queryObjects;
        assert.ok(method);
        method({ query: "foo" }, function(err, result) {
            assert.ok(!err);
            assert.ok(result);

            method({ query: "bar" }, function(err, result) {
                assert.ok(!err);
                assert.ok(result);

                // validates expectations
                login.done();
                service.done();

                done();
            });
        });
    });

    it("should login when invokes a method and session got expired", function ( done ) {

        var login = nock("https://host")
            .post("/services/oauth2/token?grant_type=password&client_id=id&client_secret=secret&username=user&password=pwdcred&format=json")
            .reply(200, {
                id          : "loginId",
                issued_at   : parseInt(new Date().getTime() / 1000),
                instance_url: "https://loginInstanceUrl",
                signature   : "loginSignature",
                access_token: "loginAccessToken"
            })
            .post("/services/oauth2/token?grant_type=password&client_id=id&client_secret=secret&username=user&password=pwdcred&format=json")
            .reply(200, {
                id          : "loginId",
                issued_at   : parseInt(new Date().getTime() / 1000),
                instance_url: "https://loginInstanceUrl",
                signature   : "loginSignature",
                access_token: "loginAccessToken"
            });

        var service = nock("https://loginInstanceUrl")
            .defaultReplyHeaders({'Content-Type': 'application/json'})
            .get("/services/data/v25.0/query?q=foo")
            .reply(200, {
                done        : true,
                totalSize   : 1,
                records     : [ { Id: "01", Name: "Test 1", attributes: { type: "Account", url: "/foo/account" } } ]
            })
            .get("/services/data/v25.0/query?q=bar")
            .reply(200, {
                done        : true,
                totalSize   : 1,
                records     : [ { Id: "02", Name: "Test 2", attributes: { type: "Order", url: "/foo/order" } } ]
            });

        // sets a short timeout (in seconds)
        config.timeout = 0.1;  
        var api = new API(config);
        var method = api.queryObjects;
        assert.ok(method);
        method({ query: "foo" }, function(err, result) {
            assert.ok(!err);
            assert.ok(result);

            setTimeout( function() {
                method({ query: "bar" }, function(err, result) {
                    assert.ok(!err);
                    assert.ok(result);

                    // validates expectations
                    login.done();
                    service.done();

                    done();
                });
            }, config.timeout + 250);
        });
    });

    it.skip("should run using valid credentials", function ( done ) {

        this.timeout(10000);

        var realConfig = {
            credential  : 'your real security token',
            username    : 'your username',
            password    : 'your password',
            clientId    : 'your cleient id',
            clientSecret: 'your client secret',
            loginHost   : 'your login host'
        };

        var api = new API(realConfig);
        var method = api.queryObjects;
        assert.ok(method);
        method({query:"SELECT Id, Name FROM Lead"}, function(err, result) {
            assert.ok(!err);
            assert.ok(result);
            done();
        });
    });
});
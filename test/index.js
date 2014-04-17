var assert  = require("assert");
var nock    = require("nock");
var API     = require("../index.js");

var connectionInfo = {
        username: "account@kidozen.com",
        password: "secret"
    };
var mockValidAuthResponse =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns=\"urn:partner.soap.sforce.com\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><soapenv:Body><loginResponse><result><metadataServerUrl>https://na15.salesforce.com/services/Soap/m/29.0/00Aa0000000Bbbb</metadataServerUrl><passwordExpired>false</passwordExpired><sandbox>false</sandbox><serverUrl>https://na15.salesforce.com/services/Soap/u/29.0/00Aa0000000Bbbb</serverUrl><sessionId>00Aa0000000Bbbb!AAaAAAaA6Aa20aaAAa.Ua0a__aA6A4Aaaa89aAaAaAAa3aaaaA.A2aAAaAAAaAaAAAAAaaaa1aaa9aaaaAA01a.a9Aaaa6A_</sessionId><userId>005a0000001aAA2AAA</userId><userInfo><accessibilityMode>false</accessibilityMode><currencySymbol>$</currencySymbol><orgAttachmentFileSizeLimit>5242880</orgAttachmentFileSizeLimit><orgDefaultCurrencyIsoCode>ARS</orgDefaultCurrencyIsoCode><orgDisallowHtmlAttachments>false</orgDisallowHtmlAttachments><orgHasPersonAccounts>false</orgHasPersonAccounts><organizationId>00Aa0000000AaaaAAA</organizationId><organizationMultiCurrency>false</organizationMultiCurrency><organizationName>machadogj.com</organizationName><profileId>00aa0000000AAaAAAA</profileId><roleId xsi:nil=\"true\"/><sessionSecondsValid>7200</sessionSecondsValid><userDefaultCurrencyIsoCode xsi:nil=\"true\"/><userEmail>account@kidozen.com</userEmail><userFullName>kidozen account</userFullName><userId>005a0000001aAA2AAA</userId><userLanguage>es</userLanguage><userLocale>es_AR</userLocale><userName>account@kidozen.com</userName><userTimeZone>America/Argentina/Buenos_Aires</userTimeZone><userType>Standard</userType><userUiSkin>Theme3</userUiSkin></userInfo></result></loginResponse></soapenv:Body></soapenv:Envelope>";

describe("salesforce", function () {
    beforeEach ( function () {
        var login = nock("https://login.salesforce.com")
            .post("/services/Soap/u/29.0")
            .reply(200, mockValidAuthResponse);
    });

    describe("Describe", function() {
        it("should describe accounts", function (done){
            var options = {
                 objectClass: "FeedItem"
            };
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .get("/services/data/v29.0/sobjects/FeedItem/describe")
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : {"name": "FeedItem","fields": [{"length": 18,"name": "InsertedById","type": "reference","defaultValue": null,"unique": false,"displayLocationInDecimal": false,"cascadeDelete": false,"restrictedDelete": false,"relationshipName": "InsertedBy","controllerName": null,"externalId": false,"inlineHelpText": null,"writeRequiresMasterRead": false,"digits": 0,"groupable": true,"permissionable": false,"referenceTo": ["User"],"relationshipOrder": null,"soapType": "tns:ID","calculatedFormula": null,"createable": false,"updateable": false,"idLookup": false,"defaultValueFormula": null,"defaultedOnCreate": false,"autoNumber": false,"picklistValues": [],"byteLength": 18,"label": "Introducido por Id.","precision": 0,"deprecatedAndHidden": false,"nameField": false,"sortable": true,"filterable": true,"caseSensitive": false,"restrictedPicklist": false,"calculated": false,"scale": 0,"nillable": false,"namePointing": true,"htmlFormatted": false,"dependentPicklist": false,"custom": false}],"childRelationships": [{"field": "EntityId","cascadeDelete": true,"restrictedDelete": false,"relationshipName": null,"childSObject": "TopicAssignment","deprecatedAndHidden": false}],"createable": true,"deletable": true,"updateable": false,"queryable": true,"searchable": true,"label": "Elemento de noticias en tiempo real","customSetting": false,"undeletable": false,"mergeable": false,"replicateable": true,"triggerable": true,"feedEnabled": false,"retrieveable": true,"searchLayoutable": false,"lookupLayoutable": null,"listviewable": null,"deprecatedAndHidden": false,"recordTypeInfos": [],"custom": false,"keyPrefix": "0D5","layoutable": false,"activateable": false,"labelPlural": "Elementos de noticias en tiempo real","compactLayoutable": false,"urls": {"rowTemplate": "/services/data/v29.0/sobjects/FeedItem/{ID}"}}
                });

            var api = new API(connectionInfo);
            api.Describe(options, function(err, result){
                assert.ok(result);
                assert.equal(true,result.done);
                done();
            });
        });
    });

    describe("Query", function() {
        it("should query accounts using SOSQL", function (done){
            var query = {
                SOSQL: "SELECT Id from Account"
            };
            
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json;charset=UTF-8'})
                .get('/services/data/v29.0/query?q=SELECT%20Id%20from%20Account')
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : {totalSize: 1,done: true,records: [{attributes: {type: "Account",url: "/services/data/v29.0/sobjects/Account/001b0000007bBBbBBB"},Id: "001b0000007bBBbBBB"}]}
                });
             
            var api = new API(connectionInfo);
            api.Query(query, function(err, result){
                assert.ok(result);
                assert.equal(true,result.done);
                done();
            });
        });

        it("should query accounts using SOSQL with credentials", function (done){
            var query = {
                SOSQL: "SELECT Id from Account",
                credentials : connectionInfo
            };
            
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json;charset=UTF-8'})
                .get('/services/data/v29.0/query?q=SELECT%20Id%20from%20Account')
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : {totalSize: 1,done: true,records: [{attributes: {type: "Account",url: "/services/data/v29.0/sobjects/Account/001b0000007bBBbBBB"},Id: "001b0000007bBBbBBB"}]}
                });
             
            var api = new API();
            api.Query(query, function(err, result){
                assert.ok(result);
                assert.equal(true,result.done);
                done();
            });
        });

        it("should query using explicit json", function (done){
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
            
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .get("/services/data/v29.0/query?q=SELECT%20Id%2C%20Name%2C%20CreatedDate%20FROM%20Account%20WHERE%20Name%20LIKE%20%27G%25%27")
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : [{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000007fTBeAAM"},"Id":"001i0000007fTBeAAM","Name":"GenePoint","CreatedDate":"2013-04-19T21:05:35.000+0000"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000007fTBlAAM"},"Id":"001i0000007fTBlAAM","Name":"Grand Hotels & Resorts Ltd","CreatedDate":"2013-04-19T21:05:35.000+0000"}]
                });
              
            var api = new API(connectionInfo);
            api.Query(query, function(err, result) {
                assert.ok(result);
                assert.equal(2,result.length);
                done();
            });
        });

        it("should query using alternate sintax for Fields and Sort", function (done){
            var query = {
                Entity: "Account",
                Conditions : { 
                    Name : { $like : 'G%' }
                },
                Fields : 'Id, Name, CreatedDate',
                Options : { 
                    Sort :'-CreatedDate Name',
                    Limit : 5,
                    Skip: 10
                }
            };

            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .get("/services/data/v29.0/query?q=SELECT%20Id%2C%20Name%2C%20CreatedDate%20FROM%20Account%20WHERE%20Name%20LIKE%20%27G%25%27")
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : [{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000007fTBeAAM"},"Id":"001i0000007fTBeAAM","Name":"GenePoint","CreatedDate":"2013-04-19T21:05:35.000+0000"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000007fTBlAAM"},"Id":"001i0000007fTBlAAM","Name":"Grand Hotels & Resorts Ltd","CreatedDate":"2013-04-19T21:05:35.000+0000"}]
                });
            
            var api = new API(connectionInfo);
            api.Query(query, function(err, result){
                assert.ok(result);
                assert.equal(2,result.length);
                done();
            });
        });
        // This version does not support SQL-like verbs
    });

    describe("Create", function() {
        it("should create an account", function (done){
            var options = {
                Entity: "Account",
                Details:
                    {
                        Name : 'My Adapter Account #4'
                    }
            };
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .post("/services/data/v29.0/sobjects/Account")
                .reply(201, {
                    done        : true,
                    totalSize   : 1,
                    records     : { id: 'someid', success: true, errors: [] }
                });
            
            //   
            var api = new API(connectionInfo);
            api.Create(options, function(err, result){
                assert.ok(result);
                assert.ok(true, result.success);
                done();
            });
        });

        it("should return 'INVALID_FIELD' error", function (done){
            var options = {
                Entity: "Account",
                Details:
                    {
                        XName : 'My Adapter Account #4'
                    }
            };
            
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .post("/services/data/v29.0/sobjects/Account")
                .reply(400, {
                    done        : true,
                    totalSize   : 1,
                    records     : [{message:"No such column 'XName' on sobject of type Account",errorCode:"INVALID_FIELD"}]
                });
            
            //   
            var api = new API(connectionInfo);
            api.Create(options, function(err, result){
                assert.ok(err);
                assert.ok("INVALID_FIELD", err.errorCode);
                done();
            });
        });
    });

    describe("Update", function() {
        it("should Update an account", function (done){
            var options = {
                Entity: "Account",
                Details:
                    {
                        Id : "001i000000VBpWhAAL",
                        Name : 'Updated Account #4'
                    }
            };
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .patch("/services/data/v29.0/sobjects/Account/001i000000VBpWhAAL")
                .reply(204, {
                    done        : true,
                    totalSize   : 1,
                    records     : { id: '001i000000VBpWhAAL', success: true, errors: [] }
                });
            
            var api = new API(connectionInfo);
            api.Update(options, function(err, result){
                assert.ok(result);
                assert.ok(true, result.success);
                done();
            });
        });

        it("should return 'NOT_FOUND' error", function (done){
            var options = {
                Entity: "Account",
                Details:
                    {
                        Id : "accountid",
                        Name : 'My Adapter Updated Account #4'
                    }
            };
            
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .patch("/services/data/v29.0/sobjects/Account/accountid")
                .reply(404, {
                    done        : true,
                    totalSize   : 1,
                    records     : [{message:"Provided external ID field does not exist or is not accessible: accountid",errorCode:"NOT_FOUND"}]
                });
            
            //   
            var api = new API(connectionInfo);
            api.Update(options, function(err, result){
                assert.ok(err);
                assert.ok("NOT_FOUND", err.errorCode);
                done();
            });
        });
    });

    describe("Delete", function() {
        it("should Delete an account", function (done){
            var options = {
                Entity: "Account",
                Details: "001i000000VBpWhAAL"
            };
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .delete("/services/data/v29.0/sobjects/Account/001i000000VBpWhAAL")
                .reply(200, {
                    done        : true,
                    totalSize   : 1,
                    records     : { id: '001i000000VBpWhAAL', success: true, errors: [] }
                });
            
            var api = new API(connectionInfo);
            api.Delete(options, function(err, result){
                assert.ok(result);
                assert.ok(true, result.success);
                done();
            });
        });

        it("should return 'NOT_FOUND' error", function (done){
            var options = {
                Entity: "Account",
                Details: "accountid"
            };
            var service = nock("https://na15.salesforce.com:443")
                .defaultReplyHeaders({'Content-Type': 'application/json'})
                .delete("/services/data/v29.0/sobjects/Account/accountid")
                .reply(404, {
                    done        : true,
                    totalSize   : 1,
                    records     : [{message:"Provided external ID field does not exist or is not accessible: accountid",errorCode:"NOT_FOUND"}]
                });
            
            var api = new API(connectionInfo);
            api.Delete(options, function(err, result){
                assert.ok(err);
                assert.ok("NOT_FOUND", err.errorCode);
                done();
            });
        });
    });

    describe("Authentication", function() {
        it("should get connection from cache", function (done){
            var api = new API(); var initializedAt;
            var userinfo = { username: "account@kidozen.com", password: "secreto*11aaaaAa0aaAaAAAaAaaaaAaA"};
            
            api.authenticate(userinfo, function(err, result) {
                initializedAt = result._initializedAt;
            });

            setTimeout((function() {
                api.authenticate({ username: "account@kidozen.com", password: "secreto*11aaaaAa0aaAaAAAaAaaaaAaA"}, function(err, result){
                    assert.equal(initializedAt, result._initializedAt);
                    done();
                });
            }), 100);
        });

        it("should authenticate using default settings in ctor.", function (done){
            var api = new API(connectionInfo); 
            api.authenticate(function(err, result) {
                assert.ok(result);
                done();
            });
        });

        it("should authenticate using custom settings in authenticate method", function (done){
            var api = new API(); 
            api.authenticate(connectionInfo, function(err, result) {
                assert.ok(result);
                done();
            });
        });
    });
});


describe("OAUTH2 Authentication", function() {
    var oauthinfo = {
        username: "account@kidozen.com",
        password: "secreto*11aaaaAa0aaAaAAAaAaaaaAaA",
        oauth2 : {
            clientId : '3AAA9A2aA3Aa17aaAAAAA5AA8aaaA3_AaAaaAAAaA9AaAAa2Aaaa_aa90aaAaAAaaA..AA7AAA93AAAaaaAA0',
            clientSecret : '9999999999999999999',
            redirectUri : 'https://login.salesforce.com/services/oauth2/token'
        }
    };
    var OAUTH2SessionInfo = {
      instanceUrl : 'https://na15.salesforce.com',
      accessToken : '00Aa0000000Bbbb!ARrARRRrRRRrr445RRrrRR2r235R9RRr0RrRrRRRRrrrrRRrrrRRRRRR0rRO8rRRrB9RRrrrrr8rrR6RRrRRR4rRrRRRRR23'
    };

    beforeEach ( function () {
        nock('https://login.salesforce.com:443')
          .post('/services/oauth2/token', "grant_type=password&username=account%40kidozen.com&password=secreto*11aaaaAa0aaAaAAAaAaaaaAaA&client_id=3AAA9A2aA3Aa17aaAAAAA5AA8aaaA3_AaAaaAAAaA9AaAAa2Aaaa_aa90aaAaAAaaA..AA7AAA93AAAaaaAA0&client_secret=9999999999999999999&redirect_uri=https%3A%2F%2Flogin.salesforce.com%2Fservices%2Foauth2%2Ftoken")
          .reply(200, "{\"id\":\"https://login.salesforce.com/id/00Aa0000000AaaaAAA/005a0000001aAA2AAA\",\"issued_at\":\"1386180765660\",\"instance_url\":\"https://na15.salesforce.com\",\"signature\":\"OOooo1O/ooOOooOoooo76OOo/OOo4OOoO+oOOoOOoOO=\",\"access_token\":\"00Aa0000000Bbbb!ARrARRRrRRRrr445RRrrRR2r235R9RRr0RrRrRRRRrrrrRRrrrRRRRRR0rRO8rRRrB9RRrrrrr8rrR6RRrRRR4rRrRRRRR23\"}", 
            { 
                'content-type': 'application/json;charset=UTF-8',
                'transfer-encoding': 'chunked' 
            });
    });

    it("should authenticate using default settings in ctor.", function (done){
        var api = new API(oauthinfo); 
        api.authenticate(function(err, result) {
            assert.ok(result);
            done();
        });
    });

    it("should authenticate using OAuth2 ", function (done) {
        var api = new API(); 
        api.authenticate(oauthinfo,function(err, result) {
            assert.ok(result);
            done();
        });
    });

    it("should execute query using OAuth2", function (done){
        var query = {
            credentials : OAUTH2SessionInfo,
            SOSQL: "SELECT Id from Account"
        };

        var service = nock("https://na15.salesforce.com:443")
            .defaultReplyHeaders({'Content-Type': 'application/json;charset=UTF-8'})
            .get('/services/data/v29.0/query?q=SELECT%20Id%20from%20Account')
            .reply(200, {
                done        : true,
                totalSize   : 1,
                records     : {totalSize: 1,done: true,records: [{attributes: {type: "Account",url: "/services/data/v29.0/sobjects/Account/001b0000007bBBbBBB"},Id: "001b0000007bBBbBBB"}]}
            });
        
        var api = new API();
        api.Query(query, function(err, result){
            assert.ifError(err);
            assert.ok(result);
            assert.equal(true,result.done);
            done();
        });

    });

});
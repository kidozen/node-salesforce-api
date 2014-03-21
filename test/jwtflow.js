var assert  = require("assert");
var nock    = require("nock");
var jwtFlow     = require("../jwtflow.js");
var jwt = require('jsonwebtoken');

describe('salesforce', function(done) {
	
	describe('OAuth JWT Bearer Profile', function(done) {

		it('Should send OAuth 2.0 JWT Bearer Request', function(done) {

			var clientId = 'client-id';
			var privateKey = 'private-key';
			var username = 'john@smith.com';

			var sfAccessToken = 'sales-force-access-token';

			var service = nock("https://login.salesforce.com")
			.filteringRequestBody(/.*/, '*')
			.post('/services/oauth2/token', '*')
			.reply(200, {
				"scope":"id full api web visualforce chatter_api",
				"instance_url":"https://na15.salesforce.com",
				"access_token": sfAccessToken
			});

			jwtFlow(clientId, privateKey, username, function(err, accessToken) {
				assert.ifError(err);
				assert.ok(accessToken);
				assert.equal(sfAccessToken, accessToken)

				service.done();
				done();
			});
		})
	})
})
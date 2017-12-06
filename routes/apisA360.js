// export modules
var fs = require('fs');
var chalk = require('chalk');
var express = require('express');
var bodyParser = require('body-parser');
var fa = require('./../Forge/fileAction.js');


var log = console.log
var router = express.Router();
var config = require('./../Forge/config.js');
var Credentials = require('./../Forge/credentials');
var parseForm = bodyParser.urlencoded({extended: false});
var ForgeSDK = require('./../node_modules/forge-apis/src/index');


// Forge objectAPI Objects
var hubsAPI = new ForgeSDK.HubsApi(),
	objectsAPI = new ForgeSDK.ObjectsApi(),
	bucketsApi = new ForgeSDK.BucketsApi(),
	derivativesApi = new ForgeSDK.DerivativesApi();


// Forge OAuth Object (3-legged OAuth)
var oAuth2ThreeLegged = new ForgeSDK.AuthClientThreeLegged(
	config.credentials.client_id, config.credentials.client_secret, config.callbackURL,
	['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], true);


//------------------------------------------------------Forge Auth API Area-------------------------------------------------------------//
/* API Forge Signin. */
router.get('/signin', function(req, res, next) {
	var url = oAuth2ThreeLegged.generateAuthUrl();
	res.end(url);
});


/* API Forgr Callback. */
router.get('/callback', function (req, res) {
	var token = new Credentials(req.session);
	var code = req.query.code;
	var forge3legged = oAuth2ThreeLegged;

	forge3legged.getToken(code).then(function (credentials) {
		token.setForgeCredentials(credentials);
		res.redirect('/')
	}).catch(function (err) {
		log(err);
		res.redirect('/')
	})
});


/* API Forge Profile. */
router.get('/profile', function(req, res, next) {
	var forge3legged = oAuth2ThreeLegged;
	var user = new ForgeSDK.UserProfileApi();
	var token = new Credentials(req.session);
	var credentials = token.getForgeCredentials();

	if (credentials === undefined) {
		res.status(401).end();
		return;
	}

	user.getUserProfile(forge3legged, credentials).then(function (profile) {
		token.setAutodeskId(profile.body.userId);
		res.json({
			name: 'fn: ' + profile.body.firstName + '/ ln: ' + profile.body.lastName,
			picture: profile.body.profileImages.sizeX40,
			id: profile.body.userId
		});
	})
	.catch(function (error) {
		log(error);
		res.status(401).end()
	})
});


//------------------------------------------------------Forge Data API Area-------------------------------------------------------------//
/* API get hubs */
router.get('/getHubs', function(req, res, next) {
	var forge3legged = oAuth2ThreeLegged;
	var token = new Credentials(req.session);
	var credentials = token.getForgeCredentials();

	if (credentials === undefined) {
		res.status(401).end();
		return;
	}

	hubsAPI.getHubs({}, forge3legged, credentials).then(function(data) {
		res.json(data.body.data);
	}).catch(function(err) {
		res.status(401).end(err);
	});
});


module.exports = router;
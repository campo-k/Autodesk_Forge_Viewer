// export modules
var fs = require('fs');
var fa = require('./fa.js');
var chalk = require('chalk');
var express = require('express');
var bodyParser = require('body-parser');

var log = console.log
var router = express.Router();
var config = require('./../config.js');
var Credentials = require('./../credentials');
var parseForm = bodyParser.urlencoded({extended: false});
var ForgeSDK = require('./../node_modules/forge-apis/src/index');


// Forge objectAPI Object	
var hubsAPI = new ForgeSDK.HubsApi(),
	objectsAPI = new ForgeSDK.ObjectsApi(),
	bucketsApi = new ForgeSDK.BucketsApi(),
	derivativesApi = new ForgeSDK.DerivativesApi();


// Forge Client Config
var CLIENT_ID = 'JlvxOz7sEUpg9iux6JBN2E6r0Q8YAiOr',
	CLIENT_SECRET = '0BR05VAvAhQW5Sbo',
	BUCKET_KEY = 'test_' + CLIENT_ID.toLowerCase(),
	REDIRECT_URL = 'http://dev.aftest.com:3005/api/callback',
	CREDENTIALS;


// Forge OAuth Object (3-legged OAuth)
var oAuth2ThreeLegged = new ForgeSDK.AuthClientThreeLegged(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL,
	['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], true);


// Forge OAuth Object (2-legged OAuth)
//var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(CLIENT_ID, CLIENT_SECRET,
//	['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], true);
//oAuth2TwoLegged.authenticate().then(function (credentials) {
//	log("**** Got Credentials",credentials);
//	CREDENTIALS = credentials
//});


// multer images location
var path = require('path');
var uploadDir = path.join( __dirname , '../uploads' );


// setting multer
var multer  = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, callback) {
        callback(null, uploadDir );
    },
    filename : function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage: storage });





//-----------------------------------------------------------Router Area----------------------------------------------------------------//
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express', uploaded: 'start' })
});

/* POST File */
router.post('/', upload.single('files'),  function(req, res, next) {
	uploadFiles(req).then(function(uploadRes) {
		log("**** Upload file response:", uploadRes.body);
		res.render('index', { title: 'Express', uploaded: JSON.stringify(uploadRes.body) })
	}, function(err) {
		console.error('\x1b[31m Error:', err, '\x1b[0m' ) ;
		res.render('index', { title: 'Express', uploaded: 'fail' })
	}).then(function() {
		fs.unlink(uploadDir + '/' + req.file.filename, function(err){
			if(err) return log(err);
			log('file deleted successfully');
	   });  
	});
});


//-------------------------------------------------------------- API Area---------------------------------------------------------------//
/* API get hubs */
router.get('/api/getHubs', function(req, res, next) {
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


//------------------------------------------------------Forge Auth API Area-------------------------------------------------------------//
/* API Forge Signin. */
router.get('/api/signin', function(req, res, next) {
	var url = oAuth2ThreeLegged.generateAuthUrl();
	res.end(url);
});


/* API Forgr Callback. */
router.get('/api/callback', function (req, res) {
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
router.get('/api/profile', function(req, res, next) {
	var forge3legged = oAuth2ThreeLegged;
	var user = new ForgeSDK.UserProfileApi();
	var token = new Credentials(req.session);
	var credentials = token.getForgeCredentials();

	if (credentials === undefined) {
		res.status(401).end();
		return;
	}

	user.getUserProfile(forge3legged, token.getForgeCredentials()).then(function (profile) {
		token.setAutodeskId(profile.body.userId);
		res.json({
			name: profile.body.firstName + ' ' + profile.body.lastName,
			picture: profile.body.profileImages.sizeX40,
			id: profile.body.userId
		});
	})
	.catch(function (error) {
		log(error);
		res.status(401).end()
	})
});


module.exports = router;
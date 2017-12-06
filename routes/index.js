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
var objectsAPI = new ForgeSDK.ObjectsApi(),
	bucketsApi = new ForgeSDK.BucketsApi(),
	derivativesApi = new ForgeSDK.DerivativesApi();


// Forge OAuth Object (2-legged OAuth)
var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
	config.credentials.client_id, config.credentials.client_secret,
	['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], true);
oAuth2TwoLegged.authenticate().then(function (credentials) {
	log("**** Got Credentials", credentials);
});


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
	res.render('index', { title: '2-legged', status: "start" })
});


/* POST File */
router.post('/', upload.single('files'),  function(req, res, next) {
	fa.uploadFiles(req, uploadDir, oAuth2TwoLegged, config.bucket_key, oAuth2TwoLegged.getCredentials()).then(function(uploadRes) {
		log("**** Upload file response:", uploadRes.body);
		res.render('index', { title: '2-legged', status: "upload success" })
	}, function(err) {
		console.error('\x1b[31m Error:', err, '\x1b[0m' ) ;
		res.render('index', { title: '2-legged', status: "upload fail" })
	}).then(function() {
		fs.unlink(uploadDir + '/' + req.file.filename, function(err){
			if(err) return log(err);
			log('file deleted successfully');
	   });  
	});
});


//------------------------------------------------------Forge Data API Area-------------------------------------------------------------//
/* API get token */
router.get('/api/token', function(req, res, next) {
	var oauth = new ForgeSDK.AuthClientTwoLegged(
		config.credentials.client_id, config.credentials.client_secret,
		['viewables:read'], true);

	oauth.authenticate().then(function (credentials) {
		res.json({
			access_token: credentials.access_token,
			expires_in: credentials.expires_in
		});
	}).catch(function(err) {
		res.status(500).end(err.developerMessage);
	});
});

/* API get bucket list */
router.get('/api/getBucketDetail', function(req, res, next) {
	var cre = oAuth2TwoLegged.getCredentials()

	bucketsApi.getBucketDetails(config.bucket_key, oAuth2TwoLegged, cre).then(function(data) {
		res.json(data.body);
	}).catch(function(err) {
		res.status(401).end(err);
	});
});


/* API get object list */
router.get('/api/getObjects', function(req, res, next) {
	var cre = oAuth2TwoLegged.getCredentials()

	objectsAPI.getObjects(config.bucket_key, {}, oAuth2TwoLegged, cre).then(function(data) {
		res.json(data.body.items);
	}).catch(function(err) {
		res.status(401).end(err);
	});
});


/* API get delete object */
router.get('/api/deleteObject', function(req, res, next) {
	var objectName = req.query.name;
	var cre = oAuth2TwoLegged.getCredentials();
	var urn = new Buffer(req.query.urn).toString('base64');

	objectsAPI.deleteObject(config.bucket_key, objectName, oAuth2TwoLegged, cre).then(function(data) {
		log('^^^***^^^' + JSON.stringify(data))

		derivativesApi.deleteManifest(urn.replace('=', ''), oAuth2TwoLegged, cre).then(function(data) {
			log('***^^^***' + JSON.stringify(data))

			res.json(data.body);
		}).catch(function(err) {
			res.status(401).end(err);
		});;
	}).catch(function(err) {
		res.status(401).end(err);
	});
});


/* API post translateFile and wait complete */
router.get('/api/getSVF', function(req, res, next) {
	var urn = new Buffer(req.query.urn).toString('base64');
	
	fa.translateFile(urn, oAuth2TwoLegged).then(function(data) {
		recursion(req, res, next, data);
	}).catch(function(err) {
		res.status(401).end(err);
	});
});


function recursion(req, res, next, data) {
	fa.manifestFile(data.body.urn, oAuth2TwoLegged).then(function(data) {
		if (data.body.progress != "complete"){
			setTimeout(recursion(req, res, next, data), 5000);
		}
		else {
			return res.json(data.body);
		}			
	}).catch(function(err) {
		return res.status(401).end(err);
	});
}


module.exports = router;
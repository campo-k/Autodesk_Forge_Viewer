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
	res.render('indexA360', { title: '3-legged', uploaded: 'start' })
});


/* POST File */
router.post('/', upload.single('files'),  function(req, res, next) {
	res.render('indexA360', { title: '3-legged', uploaded: 'start' })
});


module.exports = router;
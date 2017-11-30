var fs = require('fs')
var express = require('express');
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({extended: false});
var ForgeSDK = require('./../node_modules/forge-apis/src/index');
var router = express.Router();





//이미지 저장되는 위치 설정
var path = require('path');
var uploadDir = path.join( __dirname , '../uploads' );








// Forge Client Config
var CLIENT_ID = 'JlvxOz7sEUpg9iux6JBN2E6r0Q8YAiOr',
	CLIENT_SECRET = '0BR05VAvAhQW5Sbo',
	BUCKET_KEY = 'test_' + CLIENT_ID.toLowerCase(),
	CREDENTIALS;

// Forge objectAPI Object	
var objectAPI = ForgeSDK.ObjectsApi();

for (var attr in objectAPI )
{
	console.log(attr);
}

// Forge OAuth Object
var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(CLIENT_ID, CLIENT_SECRET,
	['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], true);

oAuth2TwoLegged.authenticate().then(function (credentials) {
	console.log("**** Got Credentials",credentials);
	CREDENTIALS = credentials
});

var uploadFiles = function(req) {
	return new Promise(function(resolve, reject) {
		fs.readFile(uploadDir + '/' + req.file.filename, function(err, data) {
			if(err) { reject(err) }
			else {
				objectAPI.uploadObject(BUCKET_KEY,
					req.file.filename,
					data.length, data, {},
					oAuth2TwoLegged, CREDENTIALS)
				.then(
					function(res) { console.log('s_up:' + res); resolve(res); },
					function(err) { console.log('f_up:' + err); reject(err); }
				);
			}
		});
	});
};







//---------------------------------------------------------------------------------------------------------------------------



//multer 셋팅
var multer  = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, callback) {
        callback(null, uploadDir );
    },
    filename : function (req, file, callback) {
        callback(null, file.originalname); // 'posts-' + Date.now() + '.'+ file.mimetype.split('/')[1] );
    }
});
var upload = multer({ storage: storage });






//---------------------------------------------------------------------------------------------------------------------------




/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express', uploaded: '' });
});

/* POST hone page */
router.post('/', upload.single('files'),  function(req, res, next) {
	uploadFiles(req).then(function(uploadRes) {
		console.log("**** Upload file response:", uploadRes.body);
		res.render('index', { title: 'Express', uploaded: uploadRes.body })
	}, function(err) {
		console.error('\x1b[31m Error:', err, '\x1b[0m' ) ;
		res.render('index', { title: 'Express', uploaded: 'fail' })
	});
});

module.exports = router;

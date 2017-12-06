var fs = require('fs');
var logs = console.log
var chalk = require('chalk');
var ForgeSDK = require('./../node_modules/forge-apis/src/index');

// Forge objectAPI Object	
var objectsAPI = new ForgeSDK.ObjectsApi(),
	bucketsApi = new ForgeSDK.BucketsApi(),
	derivativesApi = new ForgeSDK.DerivativesApi();

module.exports = {
	uploadFiles: function(req, uploadDir, oAuth2TwoLegged, BUCKET_KEY, CREDENTIALS) {
		return new Promise(function(resolve, reject) {
			fs.readFile(uploadDir + '/' + req.file.filename, function(err, data) {
				if(err) { reject(err) }
				else {
					objectsAPI.uploadObject(BUCKET_KEY,
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
	},

	getBucketDetails: function (bucketKey, oAuth2TwoLegged) {
		console.log("**** Getting bucket details : " + bucketKey);
		return bucketsApi.getBucketDetails(bucketKey, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
	},

	translateFile: function(encodedURN, oAuth2TwoLegged){
		logs(chalk.bold.green("**** Translating file derivative"));
		var postJob =
		{
			input: {
				urn: encodedURN
			},
			output: {
				formats: [
					{
						type: "svf",
						views: ["2d", "3d"]
					}
				]
			}
		};

		return new Promise(function(resolve, reject) {
			derivativesApi.translate(postJob, {}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials()).then(
				function(res){
					logs(chalk.bold.green("****", JSON.stringify(res.body)));
					resolve(res);
				},function(err){
					logs(chalk.bold.red("****", JSON.stringify(err)));
					reject(err);
				}
			)	
		});
	},

	manifestFile: function (encodedURN, oAuth2TwoLegged) {
		
		logs(chalk.bold.green("**** Getting File Manifest Status"));
		
		return new Promise(function(resolve, reject) {
			derivativesApi.getManifest(encodedURN, {}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials()).then(
				function(res){
					if (res.body.progress != "complete"){
						logs(chalk.bold.yellow("The pregress ") + res.body.progress);
						logs(chalk.bold.yellow("The status of your file is ") + chalk.bgYellow.bold(res.body.status) + chalk.bold.yellow(" Please wait while we finish Translating your file"));
						resolve(res);
					}
					else{
						logs(chalk.bold.blue("****", res.body.status));
						logs(chalk.bold.blue("****", res.body.progress));
						resolve(res);
					}
					
				},function(err){
					reject(err);
				}
			)	
		});
	}
};
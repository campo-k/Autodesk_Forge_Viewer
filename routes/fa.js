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


var getBucketDetails = function (bucketKey) {
	console.log("**** Getting bucket details : " + bucketKey);
	return bucketsApi.getBucketDetails(bucketKey, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
};



var translateFile = function(encodedURN){
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
				resolve(res);
			},function(err){
				reject(err);
			}
		)	
	});
};


var manifestFile = function (encodedURN) {
	
	logs(chalk.bold.green("**** Getting File Manifest Status"));
	
	return new Promise(function(resolve, reject) {
		derivativesApi.getManifest(encodedURN, {}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials()).then(
			function(res){
				if (res.body.progress != "complete"){
					logs(chalk.bold.yellow("The status of your file is ") + chalk.bgYellow.bold(res.body.status) + chalk.bold.yellow(" Please wait while we finish Translating your file"));
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
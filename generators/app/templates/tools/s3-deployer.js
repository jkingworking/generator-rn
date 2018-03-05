var exec = require('child_process').exec;
var wsPackage = require('../package.json');
var git = require('git-rev');
var packageName = wsPackage.name.replace('@snapk/', '');

commandFlags = {
	cwd: './dist/',
	signatureVersion :'v4',
	filePrefix: packageName + '/' + wsPackage.version,
	region: 'us-west-2',
	bucket: 'snap-static-web',
	cache: (365 * 24 * 60 * 60), // 1 year
	etag: true,
	gzip: true
};

function buildUploadCommand(commandFlags) {
	var command = 's3-deploy "' + commandFlags.cwd + '**" ';
	Object.keys(commandFlags).map(function (flag) {
		if (typeof commandFlags[ flag ] === 'boolean') {
			command += ( commandFlags[ flag ]) ? ' --' + flag : '';
		} else {
			command += ' --' + flag + ' "' + commandFlags[ flag ] + '"';
		}
	});
	return command;
}

function puts(error, stdout, stderr) {
	if (error) {
		return console.error(error);
	}
	console.log(stdout);
	console.log(stderr);
}

// Pushes this style sheet to it's version folder
exec(buildUploadCommand(commandFlags), puts);
// If on Master branch also push to latest folder
git.branch(function (branch) {
	if (branch === 'master') {
		var latestFlags = Object.assign({}, commandFlags, {
			filePrefix: packageName + '/latest',
			cache: 10 // 10 seconds
		});
		exec(buildUploadCommand(latestFlags), puts);
	}
});
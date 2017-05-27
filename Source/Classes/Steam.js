exports = module.exports = (function Steam() {
	const _domain		= 'DSTEd.grimms-welt.net';
	const _secured		= true;
	const Request		= require('request');
	const OS			= require('os');
	const Progress		= require('request-progress');
	const Software		= require('../Classes/Software')();
	const fs			= require('fs');
		
	this.init = function init() {
		
	};
	
	this.getWorkshop = function getWorkshop(data, callback) {
		var language	= 'English';
		var query		= '';
		var page		= 1;
		
		if(data != null) {
			if(typeof(data.language) != 'undefined') {
				language = data.language;
			}
			
			if(typeof(data.query) != 'undefined') {
				query = data.query;
			}
			
			if(typeof(data.page) != 'undefined') {
				page = data.page;
			}
		}
		
		Request({
			url:		'http' + (_secured ? 's' : '' ) + '://' + _domain + '/API/',
			method:		'POST',
			json:		true,
			headers: {
				'User-Agent':	'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')'
			},
			body:		{
				language:	language,
				page:		page,
				search:		query
			}
		}, function onResponse(error, response, body) {
			callback(body);
		});
	};
	
	this.getFile = function getFile(id, callback) {
		Request({
			url:		'http' + (_secured ? 's' : '' ) + '://' + _domain + '/API/',
			method:		'POST',
			json:		true,
			headers: {
				'User-Agent':	'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')'
			},
			body:		{
				file: id
			}
		}, function onResponse(error, response, body) {
			callback(JSON.parse(body));
		});
	};
	
	this.downloadFile = function downloadFile(id, callback_progress, callback_end) {
		callback_progress(0);
		
		this.getFile(id, function onData(json) {
			var path = Software.createWorkspaceProject('workshop-' + id);
			
			Progress(Request({
				url:	json.file_url,
				method:	'GET'
			})).on('progress', function onProgress(state) {
				callback_progress(state.percent * 100);
			}).on('error', function onError(error) {
				console.log(error);
			}).on('end', function() {
				callback_progress(100);
				callback_end(path + 'mod.downloaded', path);
			}).pipe(fs.createWriteStream(path + 'mod.downloaded'));
		});
	};
	
	this.init();
	return this;
});
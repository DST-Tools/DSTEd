exports = module.exports = (function Steam() {
	const Logger		= require('../Classes/Logger')();
	const _domain		= 'api.DSTEd.net';
	const _secured		= true;
	const Request		= require('request');
	const OS			= require('os');
	const Progress		= require('request-progress');
	const Software		= require('../Classes/Software')();
	const fs			= require('fs');
	const I18N			= require('../Classes/I18N')();
	var _auth_id		= null;
	var _auth_logged_in	= false;
		
	this.init = function init() {
		_auth_id   = require('electron-machine-id').machineIdSync();
	};
	
	this.checkAuthentication = function checkAuthentication(callback) {
		Request({
			url:		'http' + (_secured ? 's' : '' ) + '://' + _domain + '/steam/auth/',
			method:		'POST',
			json:		true,
			headers: {
				'User-Agent':	'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')',
				'Cookie':		Request.cookie('STEAM_AUTH=' + _auth_id)
			},
			body: {}
		}, function onResponse(error, response, body) {
			_auth_logged_in = body.authenticated;
			
			if(typeof(callback) != 'undefined') {
				callback(_auth_logged_in, body);
			}
		});
	};
	
	this.getAuthID = function getAuthID() {
		return _auth_id;
	};
	
	this.getWorkshop = function getWorkshop(data, callback) {
		var language	= 'English'; // I18N.getLanguage()
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
			url:		'http' + (_secured ? 's' : '' ) + '://' + _domain + '/steam/workshop/search/',
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
			try {
				body = JSON.parse(body);
			} catch(e) {
				/* Do Nothing */
			}

			callback(body);
		});
	};
	
	this.getFile = function getFile(id, callback) {
		Request({
			url:		'http' + (_secured ? 's' : '' ) + '://' + _domain + '/steam/workshop/details/',
			method:		'POST',
			json:		true,
			headers: {
				'User-Agent':	'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')'
			},
			body:		{
				file: id
			}
		}, function onResponse(error, response, body) {
			try {
				body = JSON.parse(body);
			} catch(e) {
				/* Do Nothing */
			}
			
			callback(body);
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
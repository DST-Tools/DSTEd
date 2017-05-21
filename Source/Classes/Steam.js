exports = module.exports = (function Steam() {
	const _domain		= 'DSTEd.grimms-welt.net';
	const _secured		= true;
	const Request		= require('request');
	const OS			= require('os');
	
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
	
	this.init();
	return this;
});
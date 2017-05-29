exports = module.exports = (function Steam() {
	var EventEmitter = require('events').EventEmitter;
	var _running = false;
	var SteamAPI = null;
	
	this.init = function init() {
		process.activateUvLoop();
	
		switch(process.platform) {
			/* OS X */
			case 'darwin':
				switch(process.arch) {
					case 'x64':
						SteamAPI = require('../Library/osx64/greenworks');
					break;
					case 'ia32':
						console.error('OS X don\'t support 32bit anymore!');
					break;
				}
			break;
			case 'win32':
				switch(process.arch) {
					case 'x64':
						SteamAPI = require('../Library/win64/greenworks');
					break;
					case 'ia32':
						SteamAPI = require('../Library/win32/greenworks');
					break;
				}
			break;
			case 'linux':
				switch(process.arch) {
					case 'x64':
						SteamAPI = require('../Library/linux64/greenworks');
					break;
					case 'ia32':
						SteamAPI = require('../Library/linux32/greenworks');
					break;
				}
			break;
		}
		
		if(SteamAPI.initAPI()) {
			SteamAPI.enableCloud(true);
			console.log(SteamAPI.getAppId());
			_running = true;
			return;
		}
		
		if(!SteamAPI.isSteamRunning())  {
			throw new Error("Steam initialization failed. Steam is not running.");
		}
		
		SteamAPI.__proto__ = EventEmitter.prototype;
		EventEmitter.call(SteamAPI);

		SteamAPI._steam_events.on = function onSteamEvents() {
			SteamAPI.emit.apply(SteamAPI, arguments);
		};

		process.versions['greenworks'] = SteamAPI._version;
		SteamAPI.enableCloud(true);
		_running = true;
	};
	
	this.getWorkshop = function getWorkshop(callback) {
		if(!_running) {
			callback('STEAM ERROR', null);
			console.log('Steam is not running!');
			return;
		}
		
		SteamAPI.ugcGetItems(SteamAPI.UGCMatchingType.ItemsReadyToUse, SteamAPI.UGCQueryType.RankedByTrend, function onSuccess(items) {
			callback(null, items);
			console.log('onSuccess', items);
		}, function onError(error) {
			callback(error, null);
			console.log('onError', error);
		});
	};
	
	this.init();	
	return this;
});
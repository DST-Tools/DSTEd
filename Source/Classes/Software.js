const electron		= require('electron');
const App			= electron.app;
const path			= require('path');
const fs			= require('fs');
const Registry		= require('winreg');
const glob			= require('glob');
const mime			= require('mime-types');
const Chokidar		= require('chokidar');
const rimraf		= require('rimraf');
const Logger		= require('../Classes/Logger')();
const I18N			= require('../Classes/I18N')();
const LUA			= require('../Classes/LUA.js');
	
exports = module.exports = (function Software() {
	var _config = null;
		
	this.init = function init() {
		if(typeof(mime.add) != 'undefined') {
			mime.add ('valve/data-file', ['vdf']);
		}
		
		var directory = path.dirname(App.getPath('exe'));
		
		if(new RegExp('node_modules', 'gi').test(directory)) {
			directory = App.getAppPath();
		}
		
		_config = directory + path.sep + 'config.json';
		Logger.info('Set Configuration-Path: ' + _config);
	};
	
	this.isInstalled = function isInstalled() {
		if(fs.existsSync(_config) && global.DSTEd.workspace != null) {
			return true;
		}
		
		return false;
	};
	
	this.loadConfig = function loadConfig() {
		var directory = path.dirname(App.getPath('exe'));
		
		if(new RegExp('node_modules', 'gi').test(directory)) {
			directory = App.getAppPath();
		}
		
		if(fs.existsSync(_config)) {
			var config = require(_config);
			
			if(typeof(global.DSTEd.workspace) != 'undefined') {
				if(fs.existsSync(config.workspace + path.sep + 'bin' + path.sep + 'dontstarve_steam.exe')) {
					global.DSTEd.workspace = config.workspace;
					Logger.info('Set Workspace: ' + global.DSTEd.workspace);
				} else {
					Logger.warn('Workspace is not DST!');
				}
			} else {
				Logger.warn('Workspace is undefined.');
			}
			
			if(typeof(config.language) != 'undefined') {
				var language = directory + path.sep + 'Languages' + path.sep + config.language + '.json';
				
				if(fs.existsSync(language)) {
					global.DSTEd.language = config.language;
					Logger.info('Set Language: ' + global.DSTEd.language);
				} else {
					Logger.warn('Failed loading Language: ' + config.language);
				}
			} else {
				Logger.warn('Language is undefined.');				
			}
		}
	};
	
	this.getDSTPath = function getDSTPath() {
		return global.DSTEd.workspace + path.sep;
	};
	
	this.saveConfig = function saveConfig() {
		var config = {
			workspace:	null
		};
		
		if(fs.existsSync(_config)) {
			config				= require(_config);
		}
		
		config.workspace	= global.DSTEd.workspace;
		
		fs.writeFile(_config, JSON.stringify(config, 0, 1), function(error) {
			if(error) {
				console.error(error);
				return;
			}
			
			Logger.info('Config saved.');
		});
	};
	
	this.loadSteamPath = function loadSteamPath() {
		var steam		= new Registry({
			hive:	Registry.HKCU,
			key:	'\\Software\\Valve\\Steam'
		});
		
		steam.get('SteamPath', function(error, item) {
			global.DSTEd.steam = path.normalize(item.value);
			
			if(process.platform === 'darwin') {
				global.DSTEd.steam = global.DSTEd.steam.normalize('NFD');
			}
			
			var pathRoot		= path.parse(global.DSTEd.steam).root;
			var noDrivePath		= global.DSTEd.steam.slice(Math.max(pathRoot.length - 1, 0));
			global.DSTEd.steam	= glob.sync(noDrivePath, { nocase: true, cwd: pathRoot })[0];
			
			Logger.info('Set Steam-Path: ' + global.DSTEd.steam);
		});
	};
	
	this.deleteWorkspaceProject = function deleteWorkspaceProject(name, callback) {
		Logger.debug('Delete Workspace-Project: ' + name);
		rimraf(global.DSTEd.workspace + path.sep + 'mods' + path.sep + name, callback);
		global.DSTEd.projects[name] = null;
		delete global.DSTEd.projects[name];
	};
	
	this.createWorkspaceProject = function createWorkspaceProject(name) {
		Logger.debug('Create Workspace-Project: ' + name);
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		fs.mkdir(mods_path + name, function onSuccess() {
			/* Do Nothing */
		});
		return mods_path + name + path.sep;
	};
	
	this.createWorkspaceWatcher = function createWorkspaceWatcher(callback_project_added, callback_project_deleted) {
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		var watcher		= Chokidar.watch(mods_path, {
			ignored:	/[\/\\]\./,
			persistent:	true
		});
		
		watcher.on('addDir', function onAddDirectory(p) {
			var segments	= p.replace(/\/+$/, '').split(path.sep);
			var lastDir		= (segments.length > 0) ? segments[segments.length - 1] : '';
			
			if(new RegExp('^workshop\-([0-9]+)$', 'gi').test(lastDir)) {
				var _wait = setInterval(function onWait() {
					if(fs.existsSync(p + path.sep + 'modinfo.lua')) {
						this.addProject(lastDir, false, callback_project_added);
						clearInterval(_wait);
					}
				}.bind(this), 1000);
			}
		}.bind(this)).on('unlinkDir', function onDeleteDirectory(p) {
			var segments	= p.replace(/\/+$/, '').split(path.sep);
			var lastDir		= (segments.length > 0) ? segments[segments.length - 1] : '';
			
			if(new RegExp('^workshop\-([0-9]+)$', 'gi').test(lastDir)) {
				callback_project_deleted(lastDir);
			}
		});
	};
	
	this.getModInfo = function getModInfo(file) {
		var core_path	= path.normalize(global.DSTEd.workspace + path.sep + 'mods').toLowerCase();
		var file_path	= path.normalize(file).toLowerCase();
		var mod_path	= file_path.replace(new RegExp('^' + core_path.replace(/\\/gi, '\\\\'), 'gi'), '');
		var split 		= mod_path.split(path.sep);
		var mod_info	= [];
		
		if(split.length > 0 && typeof(split[1]) != 'undefined') {
			if(typeof(global.DSTEd.projects[split[1]]) != 'undefined' && typeof(global.DSTEd.projects[split[1]].info) != 'undefined') {
				mod_info	= global.DSTEd.projects[split[1]].info;
			}
		}
		
		return mod_info;
	};
	
	this.addProject = function addProject(file, initial, callback_project_added) {
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		
		if(fs.statSync(mods_path + file).isDirectory()) {
			Logger.debug('Add Project: ' + file);
			var modinfo	= {};
			let lua		= new LUA();
			
			Logger.debug('...parsing LUA (modinfo.lua)');
			
			try {
				let context		= lua.parseFile(mods_path + file + path.sep + 'modinfo.lua', {
					strings:	true,
					comments:	false,
					integers:	true,
					floats:		true,
					booleans:	true
				});
				
				context.getVariables().forEach(function(entrie) {
					modinfo[entrie.name] = entrie.value;
				});
			} catch(e) {
				Logger.error('[LUA]', e);
			}
			
			/* Check if Mod is from Steam-Workshop */
			var workshop = {
				enabled:	false,
				id:			-1
			};
			
			if(file.match(/^workshop\-/g)) {
				workshop.enabled	= true;
				var matches			= (/workshop\-([0-9]+)/g).exec(file);
				workshop.id			= parseInt(matches[1], 10);
			}
			
			global.DSTEd.projects[file] = {
				name:		I18N.__('Unknown'),
				path:		mods_path + file,
				workshop:	workshop,
				info:		modinfo,
				files:		null
			};
			
			this.getDirectoryFiles(global.DSTEd.projects[file], function onEnd() {
				if(typeof(callback_project_added) != 'undefined') {
					if(!initial) {
						callback_project_added(file, global.DSTEd.projects[file]);
					}
				}
			});
		}
	};
	
	this.loadWorkspace = function loadWorkspace() {
		Logger.info('Loading Worspace...');
		
		if(global.DSTEd.workspace == null) {
			Logger.warn('Workspace is not set!');
			return;
		}
		
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		var stats		= fs.lstatSync(mods_path);
		
		if(!stats.isDirectory()) {
			Logger.warn('Mods dir dont exists (' + mods_path + ')');
			return;
		}
		
		fs.readdir(mods_path, function(error, files) {
			files.forEach(function(file) {
				this.addProject(file, true);
			}.bind(this));
		}.bind(this));
	};
	
	this.isCoreFile = function isCoreFile(file) {
		var core_path = path.normalize(global.DSTEd.workspace + path.sep + 'data').toLowerCase();
		var file_path = path.normalize(file).toLowerCase();
		
		return new RegExp('^' + core_path.replace(/\\/gi, '\\\\'), 'gi').test(file_path);
	};
	
	this.loadCore = function loadCore() {
		Logger.info('Loading Core...');
		
		var core_path	= global.DSTEd.workspace + path.sep + 'data' + path.sep;
		var stats		= fs.lstatSync(core_path);
		
		if(!stats.isDirectory()) {
			Logger.warn('Core dir dont exists (' + core_path + ')');
			return;
		}
		
		if(fs.statSync(core_path).isDirectory()) {
			global.DSTEd.core['data'] = {
				name:		'data',
				path:		core_path,
				files:		null
			};
			
			this.getDirectoryFiles(global.DSTEd.core['data'], function onEnd() {
				if(typeof(callback_core_added) != 'undefined') {
					if(!initial) {
						callback_core_added(file, global.DSTEd.core['data']);
					}
				}
			});
		}
	};
	
	this.getDirectoryFiles = function getDirectoryFiles(project, callback_end) {
		var tree = function(dir, original_path, done) {
			var name	= dir;
							
			/* Remove main path */
			name = name.replace(original_path, '');
			
			/* Remove seperator */
			if(name.substr(0, 1) == path.sep) {
				name = name.substr(1);
			}
			
			var results = {
				name:		name,
				path:		dir + path.sep,
				directory:	true,
				entries:	[]
			};
		
			fs.readdir(dir, function(err, list) {
				if(err) {
					return done(err);
				}
				
				var pending = list.length;
				
				if(!pending) {
					return done(null, results);
				}
				
				list.forEach(function(file) {
					fs.stat(dir + path.sep + file, function(err, stat) {
						if(stat && stat.isDirectory()) {
							tree(dir + path.sep + file, dir, function(err, res) {
								results.entries.push(res);
								
								if(!--pending){
									done(null, results);
								}
							});
						} else {
							var stats	= fs.lstatSync(dir + path.sep + file);
							var name	= file;
							
							/* Remove seperator */
							if(name.substr(0, 1) == path.sep) {
								name = name.substr(1);
							}
							
							results.entries.push({
								name:		name,
								path:		dir + path.sep,
								directory:	stats.isDirectory(),
								size:		stats.size,
								type:		mime.lookup(name),
								time:		{
									access:	stats.atime,
									modify:	stats.mtime,
									change:	stats.ctime
								}
							});
							
							if(!--pending) {
								done(null, results);
							}
						}
					});
				});
			});
		};
		
		tree(project.path, project.path, function(err, list) {
			project.files = list;
			callback_end();
		});
	};
	
	this.init();
	
	return this;
});
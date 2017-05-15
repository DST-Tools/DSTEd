const electron		= require('electron');
const App			= electron.app;
const path			= require('path');
const fs			= require('fs');
const Registry		= require('winreg');
const glob			= require('glob');
const mime			= require('mime-types');

exports = module.exports = (function Software() {
	var _config = App.getAppPath() + path.sep + 'config.json';
		
	this.init = function init() {
		
	};
	
	this.isInstalled = function isInstalled() {
		var file = App.getAppPath() + path.sep + 'config.json';
		
		if(fs.existsSync(file) && global.DSTEd.workspace != null) {
			return true;
		}
		
		return false;
	};
	
	this.loadConfig = function loadConfig() {
		if(fs.existsSync(_config)) {
			var config = require(_config);
			
			console.log(config);
			
			if(typeof(global.DSTEd.workspace) != 'undefined') {

			if(fs.existsSync(config.workspace + path.sep + 'bin' + path.sep + 'dontstarve_steam.exe')) {
					global.DSTEd.workspace = config.workspace;
				} else {
					console.warn('Workspace is not DST!');
				}
			} else {
				console.warn('Workspace is undefined.');
			}
		}
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
			
			console.log('Config saved.');
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
		});
	};
	
	this.loadWorkspace = function loadWorkspace() {
		if(global.DSTEd.workspace == null) {
			return;
		}
		
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		var stats		= fs.lstatSync(mods_path);
		
		if(!stats.isDirectory()) {
			console.warn('Mods dir dont exists (' + mods_path + ')');
			return;
		}
		
		fs.readdir(mods_path, function(error, files) {
			files.forEach(function(file) {
				if(fs.statSync(mods_path + file).isDirectory()) {
					var modinfo = {};
					
					try {
						console.log('----------- MODINFO -----------------');						
						var parser = require('luaparse');
						
						parser.parse(fs.readFileSync(mods_path + file + path.sep + 'modinfo.lua', 'utf8'), {
							comments: false
						}).body.forEach(function(entry) {
							var name	= '';
							var value	= null;
							
							if(typeof(entry.variables) != 'undefined') {
								entry.variables.forEach(function(variable) {
									if(variable.type == 'Identifier') {
										name = variable.name;
									}
								});
							}
							
							if(typeof(entry.init) != 'undefined') {
								entry.init.forEach(function(content) {
									switch(content.type) {
										case 'StringLiteral':
											value = content.value;
										break;
										case 'BooleanLiteral':
											value = content.value;
										break;
										case 'NumericLiteral':
											value = parseInt(content.value, 10);
										break;
										default:
											console.warn('[LUA] ' + content.type + 'is not implemented yet!');
										break;
									}
								});
							}
							
							modinfo[name] = value;
						});
						
					} catch(e) {
						console.log(e);
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
						name:		'Unknown',
						path:		mods_path + file,
						workshop:	workshop,
						info:		modinfo,
						files:		null
					};
					
					this.getProjectWorkspace(global.DSTEd.projects[file]);
				}
			}.bind(this));
		}.bind(this));
	};
	
	this.getProjectWorkspace = function getProjectWorkspace(project) {
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
		});
	};
	
	this.init();
	
	return this;
});
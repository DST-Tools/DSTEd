(function Core() {
	const electron		= require('electron');
	const Remote		= electron.remote;
	const App			= electron.app;
	const IPC			= require('electron').ipcMain;
	const Shell			= require('electron').shell;
	const Screen		= require('../Classes/Screen');
	const Menu			= require('../Classes/Menu');
	const Software		= require('../Classes/Software')();
	const Steam			= require('../Classes/Steam')();
	const path			= require('path');
	const OS			= require('os');
	const fs 			= require('fs');
	const UnZIP			= require('unzip');
	const I18N			= require('../Classes/I18N')();
	const Logger		= require('../Classes/Logger')();
	const Process		= require('child_process');
	
	this.init = function init() {
		if(typeof(global.DSTEd) == 'undefined') {
			global.DSTEd = {
				version:	'1.0.0',
				loading:	{
					percentage:	0
				},
				language:		'en_US',
				language_table: null,
				workspace:		null,
				steam:			null,
				core:			{},
				projects:		{},
				windows:		{}
			};
			
			Logger.info('Start DSTEd v' + global.DSTEd.version);
		}
		
		if(typeof(window) == 'undefined') {
			new Menu();
			
			App.on('ready', function onReady() {
				IPC.on('workspace:update', function(event, args) {
					global.DSTEd.workspace = args.path;
					
					if(args.save) {
						Software.saveConfig();
					}
					
					this.getScreen('Workspace').close();
				}.bind(this));
				
				IPC.on('steam:auth', function(event, data) {
					this.getScreen('IDE').send('steam:auth', data);
				}.bind(this));
				
				IPC.on('menu:command', function(event, command) {
					switch(command) {
						case 'steam:account':
							Steam.checkAuthentication(function onState(logged_in, data) {
								if(logged_in) {
									// @ToDo Open Account Window
									return;
								}
								
								var dialog = this.getScreen('Dialog');
									dialog.setHeight(200);
									dialog.setOnLoad(function setOnLoad() {
										dialog.send('dialog:title', I18N.__('Authentication'));
										dialog.send('dialog:header', {
											title:		I18N.__('Login with Steam'),
											content:	I18N.__('If you want to upload Mods on Steam-Workshop, you need to be authenticated by Steam.')
										});
										
										dialog.send('dialog:content', {
											content:	'<img style="display: block; margin: 0 auto;" src="../Resources/steam_login.png" data-url="' + data.url + '" />'
										});
										
										dialog.send('dialog:buttons', [{
											label:	I18N.__('Close'),
											click:	'close'
										}]);
									});
									dialog.setDebug(true).open();
							}.bind(this));
						break;
						case 'exit':
							Logger.info('Quit Application');
							App.quit();
						break;
						case 'forum':
							Shell.openExternal('http://forums.kleientertainment.com/topic/78739-dsted-the-ide-for-dont-starve-together/');
						break;
						case 'about':
							var dialog = this.getScreen('Dialog');
							dialog.setHeight(300);
							dialog.setOnLoad(function setOnLoad() {
								dialog.send('dialog:title', I18N.__('About'));
								dialog.send('dialog:header', {
									title:		'DSTEd',
									content:	I18N.__('This program is licensed under OpenSource.') + '<br />' + I18N.__('&copy 2017 Adrian Preuß | All Rights Reserved.')
								});
								
								var info			= '';
								var memory_system	= process.getSystemMemoryInfo();
								
								info += '<strong data-lang="Version:">' + I18N.__('Version:') + '</strong> ' + global.DSTEd.version;
								info += '<br /><strong data-lang="Electron:">' + I18N.__('Electron:') + '</strong> v' + process.versions.electron;
								info += '<br /><strong data-lang="Render Engine:">' + I18N.__('Render Engine:') + '</strong> Chrome v' + process.versions.chrome;
								info += '<br /><strong data-lang="Memory (RAM):">' + I18N.__('Memory (RAM):') + '</strong> ' + memory_system.free + ' / ' + memory_system.total;
								info += '<br /><strong data-lang="CPU:">' + I18N.__('CPU:') + '</strong> ';
								
								OS.cpus().forEach(function(cpu, index) {
									info += '<br /><label>[' + (index + 1) + '] ' + cpu.model + '</label>';
								});
								
								info += '<br /><strong data-lang="Network Interfaces:">' + I18N.__('Network Interfaces:') + '</strong> ';
								var networks = OS.networkInterfaces();
								Object.keys(networks).forEach(function(network) {
									info += '<br /><label>' + network + '</label>';
									
									networks[network].forEach(function(net) {
										info += '<br /><label><label>[' + net.family + '] ' + net.address + '</label></label>';
									});
								});
								
								info += '<br /><strong data-lang="Operating System">' + I18N.__('Operating System') + '</strong>';
								info += '<br /><label data-lang="Platform:">' + I18N.__('Platform:') + '</label> ' + OS.platform() + ', ' + OS.type();
								info += '<br /><label data-lang="Release:">' + I18N.__('Release:') + '</label> ' + OS.release();
								info += '<br /><label data-lang="Architecture:">' + I18N.__('Architecture:') + '</label> ' + OS.arch();
								info += '<br /><strong data-lang="Endianness:">' + I18N.__('Endianness:') + '</strong> ' + OS.endianness();
								info += '<br /><strong data-lang="Hostname:">' + I18N.__('Hostname:') + '</strong> ' + OS.hostname();
								
								dialog.send('dialog:content', {
									scrollable:	true,
									selectable: true,
									height:		155,
									content:	info
								});
								
								dialog.send('dialog:buttons', [{
									label:	I18N.__('Close'),
									click:	'close'
								}]);
							});
							dialog.open();
						break;
						case 'settings':
							this.getScreen('Settings').setDebug(true).open();
						break;
						case 'steam_workshop':
							this.getScreen('SteamWorkshop').open();
						break;
						case 'dst_run':
							/*Exec(Software.getDSTPath() + 'bin' + path.sep + 'dontstarve_steam.exe', [], {
								cwd:	Software.getDSTPath()
							}, function(error, data) {  
								Logger.info(error)
								Logger.info(data);
							});
							
							Process.execFile('D:\\Software\\Steam\\Steam.exe', ['-applaunch', 322330, '-window'], {
								cwd: 'D:\\Software\\Steam\\'
							}, function(error, data) {  
								Logger.info(error)
								Logger.info(data);
							});**/
							
							var spawn_path = '';
							var spawn_arguments = [];
							var spawn_cwd = '';
							
							switch(OS.platform()) {
								case 'linux':
									spawn_path		= 'steam'; // @ToDo get from Software.getSteamPath()
									spawn_arguments = [ 'steam://rungameid/322330']; // @ToDo don't run via steam://-Protocol, because the process cant't be tracked
									spawn_cwd		= OS.homedir(); // @ToDo get from Software.getSteamPath()
								break;
								default:
									spawn_path		= 'D:\\Software\\Steam\\Steam.exe'; // @ToDo get from Software.getSteamPath()
									spawn_arguments	= [ '-applaunch', 322330, '-window' ];
									spawn_cwd		= 'D:\\Software\\Steam\\'; // @ToDo get from Software.getSteamPath()
								break;
							}
							
							const ls = Process.spawn(spawn_path, spawn_arguments, {
								cwd:		spawn_cwd,
								detached:	false
							});
							
							Logger.info(ls);
							ls.stdout.on('data', (data) => {
								Logger.info(`stdout: ${data}`);
							});
							
							ls.stderr.on('data', (data) => {
								Logger.info(`stderr: ${data}`);
							});
							
							ls.on('close', (code) => {
								Logger.info(`child process exited with code ${code}`);
							});
							
							ls.on('exit', (code) => {
								Logger.info(`child process exited with code ${code}`);
							});
							
							ls.on('message', (code) => {
								Logger.info(`child process exited with code ${code}`);
							});
						break;
					}
				}.bind(this));
				
				IPC.on('steam:workshop:search', function(event, request) {
					Steam.getWorkshop(request, function(files) {
						this.getScreen('SteamWorkshop').send('steam:workshop:list', files);
					}.bind(this));
				}.bind(this));
				
				IPC.on('steam:workshop:install', function(event, data) {
					Steam.downloadFile(data.id, function onProgress(value) {
						this.getScreen('SteamWorkshop').send('steam:workshop:event', {
							action:	'progress',
							id:		data.id,
							value:	value
						});
						
						this.getScreen('SteamWorkshopDetails').send('steam:workshop:event', {
							action:	'progress',
							id:		data.id,
							value:	value
						});
					}.bind(this), function onEnd(file, path) {
						fs.createReadStream(file).pipe(UnZIP.Extract({
							path: path
						}).on('finish', function Finish() {
							fs.unlink(file, function onSuccess() {
								this.getScreen('SteamWorkshop').send('steam:workshop:event', {
									action:	'installed',
									id:		data.id
								});
								
								this.getScreen('SteamWorkshopDetails').send('steam:workshop:event', {
									action:	'installed',
									id:		data.id
								});
							}.bind(this));
						}.bind(this)));
					}.bind(this));
				}.bind(this));
				
				IPC.on('steam:workshop:deinstall', function(event, data) {
					Software.deleteWorkspaceProject('workshop-' + data.id, function onSuccess() {
						this.getScreen('SteamWorkshop').send('steam:workshop:event', {
							action:	'uninstalled',
							id:		data.id
						});
						
						this.getScreen('SteamWorkshopDetails').send('steam:workshop:event', {
							action:	'uninstalled',
							id:		data.id
						});
					}.bind(this));
				}.bind(this));
				
				IPC.on('steam:workshop:details', function(event, id) {
					Software.getFile(id, function onData(data) {
						this.getScreen('SteamWorkshopDetails').setPostData(data).open();
					}.bind(this));
				}.bind(this));
				
				IPC.on('dialog:command', function(event, command) {
					switch(command) {
						case 'close':
							this.getScreen('Dialog').close();
						break;
					}
				}.bind(this));
				
				IPC.on('file:open', function(event, args) {
					fs.readFile(args, 'utf8', function(error, contents) {
						this.getScreen('IDE').send('file:open', {
							type:		args.split('.').pop(),
							file:		args,
							error:		error,
							is_core:	Software.isCoreFile(args),
							content:	contents,
							modinfo:	Software.getModInfo(args)
						});
					});
				}.bind(this));
				
				IPC.on('file:save', function(event, args) {
					fs.writeFile(args.file, args.content, function(error) {
						if(error) {
							return console.log(error);
						}

						this.getScreen('IDE').send('file:saved', args.file);
					});
				}.bind(this));
				
				this.openSplash();
			}.bind(this));
			
			App.on('window-all-closed', function onWindowsClosed() {
				if(process.platform !== 'darwin') {
					App.quit();
				}
			});

			App.on('activate', function onActivate() { 
				//if(windows.splash === null) {
					// createWindow();
				//}
			});
			
			return;
		}
		
		this.openSplash();
	};
	
	this.createScreen = function createScreen(name, width, height, min_width, min_height, callback_start, callback_load, resizeable) {
		Logger.info('Create Screen "' + name + '"');
		var screen = new Screen(name);
		
		screen.setSize(width, height);
		screen.setMinSize(min_width, min_height);
		
		if(typeof(resizeable) != 'undefined') {
			screen.setResizeable(resizeable);
		}
		
		//screen.setDebug(true);
		
		if(callback_start != null) {
			screen.setOnStart(callback_start);
		}
		
		if(callback_load != null) {
			screen.setOnLoad(callback_load);
		}
		
		global.DSTEd.windows[name] = screen;
		
		return screen;
	};
	
	this.getScreen = function getScreen(name) {
		return global.DSTEd.windows[name];
	};
	
	this.openSplash = function openSplash() {
		Software.loadConfig();
		Software.loadSteamPath();
		this.loadScreens();
		this.getScreen('Splash').open();
	};
	
	this.loadScreens = function loadScreens() {
		/* Screen :: Splash */
		this.createScreen('Splash', 500, 300, null, null, function onStart() {
			if(!Software.isInstalled()) {
				this.getScreen('Workspace').open();
			}
			
			var _loader		= setInterval(function() {
				if(global.DSTEd.loading.percentage >= 100) {
					clearInterval(_loader);
					Software.loadCore();
					Software.loadWorkspace();
					this.getScreen('IDE').open();
					this.getScreen('Splash').close();
					return;
				}
				
				if(global.DSTEd.workspace == null) {
					return;
				}
				
				++global.DSTEd.loading.percentage;
			}.bind(this), 10);
		}.bind(this));
		
		/* Screen :: Workspace */
		this.createScreen('Workspace', 420, 220, null, null, function onStart() {
			
		});
		
		/* Screen :: Dialog */
		this.createScreen('Dialog', 420, 220, null, null, function onStart() {
			
		});
		
		/* Screen :: Settings */
		this.createScreen('Settings', 500, 400, 640, 165, null, function onStart() {
			
		}, true);
		
		/* Screen :: SteamWorkshop */
		this.createScreen('SteamWorkshop', 500, 400, 640, 165, function onStart() {			
			Steam.getWorkshop(null, function(files) {
				this.getScreen('SteamWorkshop').send('steam:workshop:list', files);
			}.bind(this));
		}.bind(this), null, true).setDebug(false);
		
		/* Screen :: SteamWorkshop Details */
		this.createScreen('SteamWorkshopDetails', 500, 400, 640, 165, null, function onLoad() {
			var screen	= this.getScreen('SteamWorkshopDetails');
			var data	= screen.getPostData(data);			
			screen.send('steam:workshop:details', data);
		}.bind(this), true).setMaxWidth(950).setDebug(false);
			
		/* Screen :: IDE */
		var steam_auth = null;
		
		Steam.checkAuthentication(function onState(logged_in, data) {
			steam_auth = data;
			this.getScreen('IDE').send('steam:auth', steam_auth);
		}.bind(this));
			
		this.createScreen('IDE', 800, 600, null, null, null, function onLoad() {
			this.getScreen('IDE').send('workspace:core', global.DSTEd.core);
			this.getScreen('IDE').send('workspace:projects', global.DSTEd.projects);
			this.getScreen('IDE').send('steam:auth', steam_auth);
		}.bind(this), true).setDebug(false);
		
		Software.createWorkspaceWatcher(function onProjectAdded(name, project) {
			this.getScreen('IDE').send('workspace:project:add', {name: name, project: project});
		}.bind(this), function onProjectDeleted(name) {
			this.getScreen('IDE').send('workspace:project:remove', name);
		}.bind(this));
	};

	this.init();
}());

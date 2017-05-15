(function Core() {
	const electron		= require('electron');
	const Remote		= electron.remote;
	const App			= electron.app;
	const IPC			= require('electron').ipcMain;
	const Screen		= require('../Classes/Screen');
	const Software		= require('../Classes/Software')();
	const path			= require('path');
	const fs 			= require('fs');
	
	this.init = function init() {	
		if(typeof(global.DSTEd) == 'undefined') {
			global.DSTEd = {
				loading:	{
					percentage:	0
				},
				workspace:	null,
				steam:		null,
				projects:	{},
				windows:	{}
			};
		}
		
		if(typeof(window) == 'undefined') {
			App.on('ready', function onReady() {
				IPC.on('workspace:update', function(event, args) {
					global.DSTEd.workspace = args.path;
					
					if(args.save) {
						Software.saveConfig();
					}
					
					this.getScreen('Workspace').close();
				}.bind(this));
				
				IPC.on('file:open', function(event, args) {
					fs.readFile(args, 'utf8', function(error, contents) {
						this.getScreen('IDE').send('file:open', {
							file:		args,
							error:		error,
							content:	contents
						});
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
	
	this.createScreen = function createScreen(name, width, height, callback_start, callback_load, resizeable) {
		var screen = new Screen(name);
		
		screen.setSize(width, height);
		
		if(typeof(resizeable) != 'undefined') {
			screen.setResizeable(resizeable);
		}
		
		screen.setDebug(true);
		
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
		this.createScreen('Splash', 500, 300, function onStart() {
			if(!Software.isInstalled()) {
				this.getScreen('Workspace').open();
			}
			
			var _loader		= setInterval(function() {
				if(global.DSTEd.loading.percentage >= 100) {
					clearInterval(_loader);
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
		this.createScreen('Workspace', 420, 220, function onStart() {
			
		});
		
		/* Screen :: IDE */
		this.createScreen('IDE', 800, 600, null, function onLoad() {
			this.getScreen('IDE').send('workspace:projects', global.DSTEd.projects);
		}.bind(this), true);
	};

	this.init();
}());
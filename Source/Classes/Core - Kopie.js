(function Core() {
	const electron		= require('electron');
	const Remote		= electron.remote;
	const App			= electron.app;
	const Screen		= electron.BrowserWindow;
	const path			= require('path');
	const fs 			= require('fs');
	const glob			= require('glob');
	const url			= require('url');
	let windows			= {};
	
	this.init = function init() {
		if(typeof(global.DSTEd) == 'undefined') {
			global.DSTEd = {
				loading:	{
					percentage:	0
				},
				workspace:	null,
				steam:		null,
				projects:	{}
			};
		}
		
		if(typeof(window) == 'undefined') {
			App.on('ready', function onReady() {
				this.openSplash();
			}.bind(this));
			
			App.on('window-all-closed', function onWindowsClosed() {
				if(process.platform !== 'darwin') {
					App.quit();
				}
			});

			App.on('activate', function onActivate() { 
				if(windows.splash === null) {
					// createWindow();
				}
			});
			
			return;
		}
		
		this.openSplash();
	};
	
	this.isInstalled = function isInstalled() {
		var file = App.getAppPath() + path.sep + 'config.json';
		
		if(fs.existsSync(file) && global.DSTEd.workspace != null) {
			return true;
		}
		
		return false;
	};
	
	this.loadScreens = function loadScreens() {
		
	};
	
	this.loadConfig = function loadConfig() {
		var file = App.getAppPath() + path.sep + 'config.json';
		
		if(fs.existsSync(file)) {
			var config = require(file);
			
			if(typeof(global.DSTEd.workspace) != 'undefined') {
				if(fs.existsSync(config.workspace + path.sep + 'bin' + path.sep + 'dontstarve_steam.exe')) {
					global.DSTEd.workspace = config.workspace;
				}
			}
		}
	};
	
	this.openSplash = function openSplash() {
		if(typeof(window) == 'undefined') {
			this.loadConfig();
			this.loadSteamPath();
			this.loadWorkspace();
			this.loadScreens();
		
			windows.splash = new Screen({
				width:				500,
				height:				300,
				frame:				false,
				backgroundColor:	'#2D2D30',
				vibrancy:			'popover',
				icon:				'Resources/window_icon.png'
			});
			
			windows.splash.loadURL(url.format({
				pathname:	path.join(__dirname, '..', 'Window', 'Splash.html'),
				protocol:	'file:',
				slashes:	true
			}));

			//windows.splash.webContents.openDevTools();
			windows.splash.setMenu(null);
			windows.splash.on('closed', function onClosed() {
				windows.splash = null;
			});
		
			if(!this.isInstalled()) {
				this.selectWorkspace();
				return;
			}
			
			var _loader		= setInterval(function() {
				if(global.DSTEd.loading.percentage >= 100) {
					clearInterval(_loader);
					this.openIDE();
					windows.splash.close();
					return;
				}
				
				if(global.DSTEd.workspace == null) {
					return;
				}
				
				++global.DSTEd.loading.percentage;
			}.bind(this), 10);
			return;
		}
		
		if(Remote.getCurrentWebContents().getURL().match(/Main/g)) {
			this.openIDE();
			return;
		}
		
		if(Remote.getCurrentWebContents().getURL().match(/Workspace/g)) {
			this.selectWorkspace();
			return;
		}
		
		if(Remote.getCurrentWebContents().getURL().match(/Splash/g)) {
			var progress = document.querySelector('ui-progress ui-percentage');
			
			if(typeof(progress) != 'undefined') {
				setInterval(function TrackingPercentage() {
					progress.style.width = Remote.getGlobal('DSTEd').loading.percentage + '%';
				}, 10);
			}
		}
	};
	
	this.loadWorkspace = function loadWorkspace() {
		var mods_path	= global.DSTEd.workspace + path.sep + 'mods' + path.sep;
		
		fs.readdir(mods_path, function(error, files) {
			files.forEach(function(file) {
				if(fs.statSync(mods_path + file).isDirectory()){
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
						info:		modinfo
					};
				}
			});
		});
	};
	
	this.loadSteamPath = function loadSteamPath() {
		var Registry	= require('winreg');
		
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
	
	this.selectWorkspace = function selectWorkspace() {
		if(typeof(window) == 'undefined') {			
			windows.workspace = new Screen({
				width:				300,
				height:				200,
				frame:				false,
				backgroundColor:	'#2D2D30',
				vibrancy:			'popover',
				icon:				'Resources/window_icon.png'
			});
			
			windows.workspace.loadURL(url.format({
				pathname:	path.join(__dirname, '..', 'Window', 'Workspace.html'),
				protocol:	'file:',
				slashes:	true
			}));

			//windows.workspace.webContents.openDevTools();
			windows.workspace.setMenu(null);
			windows.workspace.on('closed', function() {
				windows.workspace = null
			});
			return;
		}
		
		if(Remote.getCurrentWebContents().getURL().match(/Workspace/g)) {
			var chooser 	= document.querySelector('input[name="chooser"]');
			var workspace	= document.querySelector('input[name="workspace"]');
			
			workspace.value = Remote.getGlobal('DSTEd').steam + 'SteamApps/common/Don\'t Starve Together/';
			
			document.querySelector('button[name="select"]').addEventListener('click', function(event) {
				chooser.click();
			});
			
			chooser.addEventListener('change', function(event) {
				workspace.value = event.target.files[0].path;
			});
		}
	};
	
	this.openIDE = function openIDE() {
		if(typeof(window) == 'undefined') {
			windows.main = new Screen({
				width: 800,
				height: 600,
				frame: false,
				backgroundColor:	'#2D2D30',
				vibrancy: 'popover',
				icon:	'Resources/window_icon.png'
			});
			
			windows.main.loadURL(url.format({
				pathname:	path.join(__dirname, '..', 'Window', 'Main.html'),
				protocol:	'file:',
				slashes:	true
			}));

			setTimeout(function() {
				windows.main.webContents.openDevTools();
			}, 1000);
			
			windows.main.setMenu(null);
			windows.main.on('closed', function onClosed() {
				windows.main = null
			});
			return;
		}
		
		if(Remote.getCurrentWebContents().getURL().match(/Main/g)) {
			document.addEventListener('click', function onClick(event) {
				const win = Remote.getCurrentWindow();
				
				if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.action) != 'undefined') {
					switch(event.target.dataset.action) {
						case 'window:close':
							win.close();
						break
						case 'window:maximize':
							document.querySelector('button[data-action="window:maximize"]').dataset.action = 'window:restore';
							
							if(!win.isMaximized()) {
								win.maximize();
							} else {
								win.unmaximize();
							}
						break;
						case 'window:restore':
							win.restore();
							document.querySelector('button[data-action="window:restore"]').dataset.action = 'window:maximize';
						break;
						case 'window:minimize':
							if(!win.isMinimized()) {
								win.minimize();
							} else {
								win.unminimize();
							}
						break;
					}
				}
			});
			
			var workspace_projects	= document.querySelector('ui-projects');
			var projects			= Remote.getGlobal('DSTEd').projects;
			Object.keys(projects).map(function(key, index) {
				var project = projects[key];
				
				var project_html = '<project-entry>';
				
				project_html += '<project-name class="collapsible">' + key + '</project-name>';
				project_html += '</project-entry>';
				workspace_projects.innerHTML += project_html;
			});
			
			try {
				const Application	= require('../Classes/Application.js');
				_app				= new Application();		
				_app.init();
			} catch(e) {
				console.log(e);
			}
			
			try {
				const Editor	= require('../Classes/Editor.js');
				_editor			= new Editor();		
				_editor.init();
			} catch(e) {
				console.log(e);
			}
		}
	};
	
	this.init();
}());
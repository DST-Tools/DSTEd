(function Core() {
	const electron		= require('electron');
	const Remote		= electron.remote;
	const App			= electron.app;
	const Screen		= require('../Classes/Screen');
	const Software		= require('../Classes/Software')();
	const path			= require('path');
	const fs 			= require('fs');
	let _windows		= {};
	
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
	
	this.createScreen = function createScreen(name, width, height, callback_backend, callback_frontend) {
		var screen = new Screen(name);
		screen.setSize(width, height);
		screen.setDebug(true);
		screen.setOnBackend(callback_backend);
		screen.setOnFrontend(callback_frontend);
		_windows[name] = screen;
		
		return screen;
	};
	
	this.getScreen = function getScreen(name) {
		return _windows[name];
	};
	
	this.loadScreens = function loadScreens() {
		/* Screen :: Splash */
		this.createScreen('Splash', 500, 300, function onBackend() {
			if(!Software.isInstalled()) {
				this.selectWorkspace();
				return;
			}
			
			var _loader		= setInterval(function() {
				if(global.DSTEd.loading.percentage >= 100) {
					clearInterval(_loader);
					this.openIDE();
					_windows.splash.close();
					return;
				}
				
				if(global.DSTEd.workspace == null) {
					return;
				}
				
				++global.DSTEd.loading.percentage;
			}.bind(this), 10);
		}.bind(this), function onFrontend(remote, DSTEd) {
			if(remote.getCurrentWebContents().getURL().match(/Main/g)) {
				this.openIDE();
				return;
			}
			
			if(remote.getCurrentWebContents().getURL().match(/Workspace/g)) {
				this.selectWorkspace();
				return;
			}
				
			if(remote.getCurrentWebContents().getURL().match(/Splash/g)) {
				var progress = document.querySelector('ui-progress ui-percentage');
				
				if(typeof(progress) != 'undefined') {
					setInterval(function TrackingPercentage() {
						progress.style.width = DSTEd.loading.percentage + '%';
					}, 10);
				}
			}
		}.bind(this));
		
		/* Screen :: Workspace */
		this.createScreen('Splash', 500, 300, function onBackend() {
			
		}, function onFrontend(remote, DSTEd) {
			
		});
		
		/* Screen :: IDE */
		this.createScreen('Splash', 500, 300, function onBackend() {
			
		}, function onFrontend(remote, DSTEd) {
			
		});
	};
	
	this.openSplash = function openSplash() {
		if(typeof(window) == 'undefined') {
			Software.loadConfig();
			Software.loadSteamPath();
			Software.loadWorkspace();
			this.loadScreens();
			
			this.getScreen('Splash').open();
			return;
		}
		
		this.getScreen('Splash').call('Frontend');
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
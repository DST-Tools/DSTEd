const electron		= require('electron');
const Remote		= electron.remote;
var _path			= require('path');
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function Workspace() {
	this.init = function init() {
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
		
		var chooser 	= document.querySelector('input[name="chooser"]');
		var workspace	= document.querySelector('input[name="workspace"]');
		workspace.value	= Remote.getGlobal('DSTEd').steam + _path.sep + 'SteamApps/common/Don\'t Starve Together/';

		document.querySelector('button[name="select"]').addEventListener('click', function onClick(event) {
			chooser.click();
		});

		chooser.addEventListener('change', function(event) {
			workspace.value = event.target.files[0].path;
		});
		
		document.querySelector('button[name="ok"]').addEventListener('click', function onClick(event) {
			IPC.send('workspace:update', {
				path:	workspace.value,
				save:	document.querySelector('input[name="save"]').checked
			});
		});
	};
	
	this.init();
}());
const electron		= require('electron');
const Remote		= electron.remote;
var _path			= require('path');
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function SteamWorkshop() {
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
		
		IPC.on('steam:workshop:list', function(event, data) {
			console.log(data);
		});			
	};
	
	this.init();
}());
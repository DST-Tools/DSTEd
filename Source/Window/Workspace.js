const electron		= require('electron');
const Remote		= electron.remote;
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function Workspace() {
	this.init = function init() {
		var chooser 	= document.querySelector('input[name="chooser"]');
		var workspace	= document.querySelector('input[name="workspace"]');
		workspace.value	= Remote.getGlobal('DSTEd').steam + 'SteamApps/common/Don\'t Starve Together/';

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
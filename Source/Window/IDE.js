const electron		= require('electron');
const Remote		= electron.remote;
const DSTEd			= Remote.getGlobal('DSTEd');

(function IDE() {
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
	};
	
	this.init();
}());
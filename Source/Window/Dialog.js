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
		
		IPC.on('dialog:title', function(event, title) {
			document.querySelector('header ui-title').innerHTML = title;
		});
		
		IPC.on('dialog:header', function(event, header) {
			document.querySelector('section section-header h1').innerHTML	= header.title;
			document.querySelector('section section-header p').innerHTML	= header.content;
		});
		
		IPC.on('dialog:buttons', function(event, buttons) {
			var footer = document.querySelector('footer');
			
			buttons.forEach(function(button) {
				var b		= document.createElement('button');
				b.innerHTML	= button.label;
				
				b.setAttribute('name', button.click);
				
				b.addEventListener('click', function onCLick(event) {
					IPC.send('dialog:command', button.click);
				});
				footer.appendChild(b);
			});
		});
		
		IPC.on('dialog:content', function(event, data) {
			var section			= document.querySelector('section');
			var content			= document.createElement('section-content');
			
			if(typeof(data.height) != 'undefined') {
				content.style.height = data.height + 'px';
			}
			
			if(typeof(data.scrollable) != 'data.scrollable' && data.scrollable) {
				content.classList.add('scrollable');
			}
			
			content.innerHTML	= data.content;
			
			section.appendChild(content);
		});
	};
	
	this.init();
}());
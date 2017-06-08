const electron		= require('electron');
const Remote		= electron.remote;
var _path			= require('path');
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function Dialog() {
	this.init = function init() {		
		document.addEventListener('click', function onClick(event) {
			const win = Remote.getCurrentWindow();
				
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.url) != 'undefined') {
				var content		= document.querySelector('section-content');
				var frame		= document.createElement('iframe');
				content.classList.add('steam');
				frame.src		= event.target.dataset.url;
				frame.onload	= function onLoad() {
					var frame_document	= (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
					var frame_head		= frame_document.getElementsByTagName('head')[0];
					var frame_style		= document.createElement('link');
					
					frame_style.setAttribute('type',	'text/css');
					frame_style.setAttribute('rel',		'stylesheet');
					frame_style.setAttribute('href',	'https://DSTEd.net/SteamRemote.css?t=_' + new Date());
					
					frame_head.appendChild(frame_style);
					frame.classList.add('visible');
					
					setTimeout(function() {
						content.classList.add('frame');
					}, 1000);
					
					setInterval(function() {
						var frame_document	= (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
						var json			= null;
						var innerHTML		= frame_document.body.innerHTML;
						
						if(innerHTML && innerHTML.match(/^<pre/i)) {
							innerHTML = frame_document.body.firstChild.firstChild.nodeValue;
						}
						
						try {
							json = JSON.parse(innerHTML);
						
							if(typeof(json.authenticated) != 'undefined') {
								IPC.send('steam:auth', json);
								win.close();
							}
						} catch(e) {
							/* Do Nothing */
						}
					}, 500);
				};
				
				content.innerHTML = '';
				content.appendChild(frame);
				win.setSize(420, 650);
				win.center();
				return;
			}
			
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
			var footer			= document.querySelector('footer');
			footer.innerHTML	= '';
			
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
			var old_content		= document.querySelectorAll('section-content');
			
			Array.prototype.forEach.call(old_content, function onEntrie(node) {
				node.parentNode.removeChild(node);
			});
			
			var content			= document.createElement('section-content');
			
			if(typeof(data.height) != 'undefined') {
				content.style.height = data.height + 'px';
			}
			
			if(typeof(data.scrollable) != 'undefined' && data.scrollable) {
				content.classList.add('scrollable');
			}
			
			if(typeof(data.selectable) != 'undefined' && data.selectable) {
				content.classList.add('selectable');
			}
			
			content.innerHTML	= data.content;
			
			section.appendChild(content);
		});
	};
	
	this.init();
}());
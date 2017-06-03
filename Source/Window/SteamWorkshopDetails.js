const electron			= require('electron');
const Remote			= electron.remote;
const Shell				= electron.shell;
const IPC				= require('electron').ipcRenderer;
const DSTEd				= Remote.getGlobal('DSTEd');
const I18N				= require('../Classes/I18N')();
	
(function SteamWorkshopDetails() {	
	this.init = function init() {
		document.addEventListener('click', function onClick(event) {
			const win = Remote.getCurrentWindow();
			
			if(event.target.nodeName == 'A') {
				event.preventDefault();
				Shell.openExternal(event.target.href);
				return;
			}
			
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.tab) != 'undefined') {
				console.log(event.target.dataset.tab);
				var tabs		= document.querySelectorAll('ui-tab');
				var contents	= document.querySelectorAll('tab-content');
		
				Array.prototype.forEach.call(contents, function onEntrie(node) {
					node.classList.remove('visible');
				});
				
				Array.prototype.forEach.call(tabs, function onEntrie(tab) {
					tab.classList.remove('active');
				});
				
				event.target.classList.add('active');
				document.querySelector('tab-content#' + event.target.dataset.tab).classList.add('visible');
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
					case 'steam:workshop:deinstall':
						IPC.send('steam:workshop:deinstall', {
							id:		event.target.value,
							button:	event.target
						});
					break;
					case 'steam:workshop:install':
						IPC.send('steam:workshop:install', {
							id:		event.target.value,
							button:	event.target
						});
					break;
				}
			}
		});
		
		IPC.on('steam:workshop:details', function(event, data) {
			this.setDetails(data);
		}.bind(this));
		
		IPC.on('steam:workshop:event', function(event, data) {
			switch(data.action) {
				case 'progress':
					var button			= document.querySelector('button[name="install"]');
					button.innerHTML	= parseInt(data.value, 10) + '%';
					button.classList.add('loading');
				break;
				case 'installed':
					var button				= document.querySelector('button[name="install"]');
					button.innerHTML		= I18N.__('Deinstall');
					button.dataset.action	= 'steam:workshop:deinstall';
					button.classList.remove('loading');
					button.setAttribute('name', 'deinstall');
				break;
				case 'uninstalled':
					var button				= document.querySelector('button[name="deinstall"]');
					button.innerHTML		= I18N.__('Install');
					button.dataset.action	= 'steam:workshop:install';
					button.classList.remove('loading');
					button.setAttribute('name', 'install');
				break;
			}
		});	
	};
	
	this.setDetails = function setDetails(data) {
		console.log(data);
		var header		= document.querySelector('section-header');
		var picture		= header.querySelector('mod-picture');
		var title		= header.querySelector('mod-title');
		
		title.innerHTML					= data.title;
		picture.style.backgroundImage	= 'url(' + data.preview_url + ')'
		
		document.querySelector('section-sidebar span[data-name="version"]').innerHTML	= this.getVersion(data.tags);
		document.querySelector('section-sidebar span[data-name="author"]').innerHTML	= '<a href="' + data.user.url + '" target="_blank"><img src="' + data.user.picture + '" alt="Picture" data-langalt="Preview" /> <span>' + data.user.username + '</span></a>';
		document.querySelector('section-sidebar span[data-name="updated"]').innerHTML	= Application.Utils.TimeAgo(new Date(data.time_updated * 1000)) + ' ago';
		document.querySelector('section-sidebar span[data-name="size"]').innerHTML		= Application.Utils.ByteSize(data.file_size);
		document.querySelector('section-sidebar span[data-name="downloads"]').innerHTML	= data.subscriptions;
		
		document.querySelector('ui-tab[data-tab="comments"] ui-badge').innerHTML		= data.num_comments_public;
		document.querySelector('tab-content[id="description"]').innerHTML				= data.description.html + this.getTags(data.tags);
		
		var statistics = '';
		statistics += '<br /><label data-lang="Created:">Created:</label>' + Application.Utils.FormatDate(new Date(data.time_created * 1000));
		statistics += '<br /><label data-lang="Updated:">Updated:</label>' + Application.Utils.FormatDate(new Date(data.time_updated * 1000));
		statistics += '<br /><label data-lang="Views:">Views:</label>' + data.views;
		statistics += '<br /><label data-lang="Followers:">Followers:</label>' + data.followers;
		statistics += '<br /><label data-lang="Favorited:">Favorited:</label>' + data.favorited;
		statistics += '<br /><label data-lang="Favorited (Lifetime):">Favorited (Lifetime):</label>' + data.lifetime_favorited;
		statistics += '<br /><label data-lang="Subscriptions:">Subscriptions:</label>' + data.subscriptions;
		statistics += '<br /><label data-lang="Subscriptions (Lifetime):">Subscriptions (Lifetime):</label>' + data.lifetime_subscriptions;
		statistics += '<br /><label data-lang="Reports:">Reports:</label>' + data.num_reports;
		document.querySelector('tab-content[id="statistics"]').innerHTML	= statistics;
		
		this.handleButton(data.publishedfileid);
		
		/*
			kvtags:			[
				key: "last_downloaded_accountid"
				value: "139182511"
				
				key: "last_downloaded_time"
				value: "1473460033"
			]
			previews: [
				filename: "screenshot.jpg"
				preview_type: 0
				previewid: "2356520"
				size: 313735
				url: "https://steamuserimages-a.akamaihd.net/ugc/37481700732106845/816FE1F5048E1522918A2D763D0BBE7B4B5D683C/"
				
				external_reference: ""
				preview_type: 1
				previewid: "2356521"
				youtu
				bevideoid: "6R3LFe43kX4"				
			]
			tags [
				tag
			]
		*/
	};
	
	this.handleButton = function handleButton(file) {
		var button = document.querySelector('button[name="install"],button[name="deinstall"]');
		
		if(this.isInstalled(parseInt(file, 10))) {
			button.setAttribute('name', 'deinstall');
			button.dataset.action	= 'steam:workshop:deinstall';
			button.value			= file;
			button.innerHTML		= I18N.__('Deinstall');
		} else {
			button.setAttribute('name', 'install');
			button.dataset.action	= 'steam:workshop:install';
			button.value			= file;
			button.innerHTML		= I18N.__('Install');
		}
	};
	
	this.isInstalled = function isInstalled(id) {
		return (typeof(DSTEd.projects['workshop-' + id]) != 'undefined');
	};

	this.getTags = function getTags(tags) {
		var html = '<mod-tags>';
		
		tags.forEach(function(entrie) {
			if(new RegExp('^version:', 'gi').test(entrie.tag)) {
				return;
			}
			
			html += '<mod-tag>' + entrie.tag + '</mod-tag>';
		});
		
		html += '</mod-tags>';
		
		return html;
	};
	
	this.getVersion = function getVersion(tags) {
		var version = '0.0.0';
		
		tags.forEach(function(entrie) {
			if(new RegExp('^version:', 'gi').test(entrie.tag)) {
				version = entrie.tag.replace('version:', '');
			}
		});
		
		return version;
	};
	
	this.init();
}());
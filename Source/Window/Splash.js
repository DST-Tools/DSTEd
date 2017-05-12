const electron		= require('electron');
const Remote		= electron.remote;
const DSTEd			= Remote.getGlobal('DSTEd');

(function Splash() {
	this.init = function init() {
		var progress = document.querySelector('ui-progress ui-percentage');
		
		if(typeof(progress) != 'undefined') {
			setInterval(function TrackingPercentage() {
				progress.style.width = DSTEd.loading.percentage + '%';
			}, 10);
		}
	};
	
	this.init();
}());
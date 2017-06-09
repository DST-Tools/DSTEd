(function PackageBuild() {
	var _child_process	= require('child_process');
	var _path			= require('path');
	var _fs				= require('fs');
	var _archiver		= null;
	var _output			= null;
	
	this.init = function init() {
		_archiver	= this.requireGlobal('archiver');
		
		console.log('Check for Builds...');
		
		var build_path	= _path.join(__dirname, '..', 'Build');
		var source_path	= _path.join(__dirname, '..', 'Source');
		var stats		= _fs.lstatSync(build_path);
		
		if(!stats.isDirectory()) {
			console.warn('Build dir dont exists (' + build_path + ')');
			return;
		}
		
		_fs.readdir(build_path, function(error, files) {
			files.forEach(function(file) {
				console.log('Found Build: ' + file);
				this.createArchive(build_path, file, source_path);
			}.bind(this));
		}.bind(this));
	};
	
	this.createArchive = function createArchive(build_path, file, source_path) {
		console.log('[' + file + '] create Archive');
		_output		= _fs.createWriteStream(build_path + _path.sep + file + '.zip');
		
		_output.on('error', function onError(error) {
			console.log('[ERROR] ' + file + ' - FileStream: ', error);
		});
		
		_archive	= _archiver('zip', {
			zlib: {
				level: 9
			}
		});
		
		_output.on('error', function onError() {
			console.log('[ERROR] ' + file + ' - Archive:', arguments);
		});
		
		_output.on('close', function onClose() {
			console.log('[FINISHED] ' + file + ': ' + _archive.pointer() + ' total bytes');
		});
		
		_archive.pipe(_output);
		_archive.directory(build_path + _path.sep + file + _path.sep, false);
		
		/* Adding Sample Config */
		_archive.append(_fs.createReadStream(source_path + _path.sep + 'example.config.json'), {
			name: 'example.config.json'
		});
		
		/* Adding empty Language Directory */
		_archive.append(null, {
			name: 'Languages/'
		});
		
		_archive.finalize();
	};
	
	this.requireGlobal = function requireGlobal(package) {
		var globalNodeModules	= _child_process.execSync('npm root -g').toString().trim();
		var packageDir			= _path.join(globalNodeModules, package);
		
		if(!_fs.existsSync(packageDir)) {
			packageDir = _path.join(globalNodeModules, 'npm/node_modules', package); //find package required by old npm
		}
		
		if(!_fs.existsSync(packageDir)) {
			throw new Error('Cannot find global module \'' + package + '\'');
		}
		
		var packageMeta	= JSON.parse(_fs.readFileSync(_path.join(packageDir, 'package.json')).toString());
		var main		= _path.join(packageDir, packageMeta.main);

		return require(main);
	};
	
	this.init();
}());




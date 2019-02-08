const Logger = require('../Logger')();
//use Native squish to decode it
module.exports = (function Texture() {
	const Platform = {
		PC:			12,
		XBOX360:	11,
		PS3:		10,
		Unknown:	0
	};
	
	const PixelFormat = {
		DXT1:		0,
		DXT3:		1,
		DXT5:		2,
		ARGB:		4,
		Unknown:	7
	};
	
	const TextureType = {
		OneD:		1,
		TwoD:		2,
		ThreeD:		3,
		Cubemap:	4
	};
	
	var _platform		= null;
	var _pixel_format	= null;
	var _texture_type	= null;
	var _num_mips		= null;
	var _flags			= null;
	var _remainder		= null;
	var _remainder_old	= null;
	var _raw			= null;
	
	this.parse = function parse(content) {
		buffer = new Buffer(content);
		header = buffer.readUInt8();
		
		var signature = buffer.toString('utf8', 0, 4);
		
		Logger.debug('Signature', signature);
		
		Logger.debug('Parse Header');
		_platform		= header & 15;
		_pixel_format	= (header >> 4)  & 31;
		_texture_type	= (header >> 9)  & 15;
		_num_mips		= (header >> 13) & 31;
		_flags			= (header >> 18) & 3;
		_remainder		= (header >> 20) & 4095;
		_remainder_old	= (header >> 14) & 262143;
		
		_raw = buffer.toString('utf8', 4);
		console.log({
			_platform:		this.getPlatform(),
			_pixel_format:	this.getPixelFormat(),
			_texture_type:	this.getTextureType(),
			_num_mips:		this.getMipsAvailable(),
			_flags:			_flags,
			_remainder:		_remainder,
			isPreCaveUpdate: this.isPreCaveUpdate()
		});
		/*

		// Just a little hack for pre cave updates, can remove later.
		

		File.Raw = reader.ReadBytes((int)(reader.BaseStream.Length - reader.BaseStream.Position));
		/
		*/
		console.log(this.getMainMipMap());
	};
	
	this.getPlatform = function getPlatform() {
		var platform = null;
		
		Object.keys(Platform).forEach(function(key) {
			if(Platform[key] == _platform) {
				platform = key;
				return;
			}
		});
		
		return platform;
	};
	
	this.getPixelFormat = function getPixelFormat() {
		var format = null;
		
		Object.keys(PixelFormat).forEach(function(key) {
			if(PixelFormat[key] == _pixel_format) {
				format = key;
				return;
			}
		});
		
		return format;
	};
		
	this.getTextureType = function getTextureType() {
		var type = null;
		
		Object.keys(TextureType).forEach(function(key) {
			if(TextureType[key] == _texture_type) {
				type = key;
				return;
			}
		});
		
		return type;
	};
	
	this.getMipsAvailable = function getMipsAvailable() {
		return _num_mips;
	};
	
	this.isPreCaveUpdate = function isPreCaveUpdate() {
		return _remainder_old == 262143;
	};
	
	this.getMainMipMap = function getMainMipMap() {
		var buffer = new Buffer(_raw);
		
		console.log({
			width:		buffer.readUInt16LE(),
			height:		buffer.readUInt16LE(),
			pitch:		buffer.readUInt16LE(),
			size:		buffer.readUInt32LE()
		});

        //reader.BaseStream.Seek((File.Header.NumMips - 1) * 10, SeekOrigin.Current);
		//mipmap.Data = reader.ReadBytes((int)mipmap.DataSize);
	};
	
	this.getMipMaps = function getMipMaps() {
		var entries = new Array(_num_mips);
		var Readable = require('stream').Readable;
		var content = new Readable(_raw);

		for(var index = 0; index < _num_mips; index++) {
			entries[index] = {
				width:	content.read(16),
				height:	content.read(16),
				pitch:	content.read(16),
				size:	content.read(32)
			};
		}
		
		Logger.debug(entries);
		
		for(var index = 0; index < _num_mips; index++) {
			entries[index].datta = content.read(entries[index].size);
		}
		
		Logger.debug(entries);
		return entries;
	};
});
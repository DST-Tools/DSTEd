const LUA		= require('./Source/Classes/LUA.js');
const path		= 'D:/Software/Steam/SteamApps/common/Don\'t Starve Together/mods/';
const mod		= 'workshop-921913701';
let lua			= new LUA();
let context		= lua.parseFile(path + mod + '/modinfo.lua', {
	strings:	true,
	comments:	true,
	integers:	true,
	floats:		true,
	booleans:	true
});

console.log(context.getVariables());
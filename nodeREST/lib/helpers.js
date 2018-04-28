/*
* Helpers function for our library
*
*/

//Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for the all the helpers
var helpers = {};

// create a SHA256 hash
helpers.hash = function(str) {
	if(typeof(str)=='string' && str.length > 0){
		var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

//Parse a JSON string to object in all cases
helpers.parseJsonToObject = function(str){
	console.log("coming here");
	try{
		console.log("coming here"+str);
		var obj = JSON.parse(str);
		return obj;
	} catch(e){
		console.log("coming here.." +e);
		return {};
	}
};


// Exports the module
module.exports = helpers;
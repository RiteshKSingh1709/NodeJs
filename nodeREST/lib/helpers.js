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
	try{
		console.log("coming here"+str);
		var obj = JSON.parse(str);
		return obj;
	} catch(e){
		console.log("coming here.." +e);
		return {};
	}
};

//Create a random string of specified string length
helpers.createRandomString = function(strLength){
	var strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
	if(strLength) {
		//Define all the possible character
		var possibleCharacter = 'abcdefghijklmnopqrstuvwxyz0123456789';
		//start the string
		var str = '';
		for(var i=0;i<strLength;i++) {
			//Get a random character from the possible character
			var randomCharacter = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));
			//Apppend this character with the final string
			str += randomCharacter;
		}

		//Return the final string
		return str;

	} else {
		return false;
	}
};


// Exports the module
module.exports = helpers;
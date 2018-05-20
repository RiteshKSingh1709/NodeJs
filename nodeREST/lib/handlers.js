/*
*  Request handlers
*
*/

//Dependecies
var _data = require('./data');
var helpers = require('./helpers');
//Define the handler
var handlers = {};

//Users
handlers.users = function(data,callback){
	var acceptableMethods = ['post','get','put','delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._users[data.method](data,callback);
	} else {
		// returning 405 that method is not available
		callback(405);
	}
};

//Container for user submethods
handlers._users = {};

// Users - POST
// Required data firstName,lastName,Phn Number,password,tosAgreement
handlers._users.post = function(data,callback){
	//Check all the required field are filled out
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.payload.phone == 'string') && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password == 'string') && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement == 'boolean') && data.payload.tosAgreement == true ? true : false;

	if(firstName&& lastName && phone && password && tosAgreement){
		//Make sure that user doesnot exists
		_data.read('users',phone,function(err,data){
			if(err) {
				// Hash the password
				var hashedPassword = helpers.hash(password);

				//sanity check for hashedPassword
				if(hashedPassword){
						//Create User Object
					var userObject = {
						'firstName' : firstName,
						'lastName'  : lastName,
						'phone'     : phone,
						'password'  : hashedPassword,
						'tosAgreement' : true,
					};

					_data.create('users',phone,userObject,function(err){
						if(!err) {
							callback(200);
						} else {

							callback(500,{'Error' : 'Couldnot create the new user'});
						}
					});
				} else {

					callback(500,{'Error': 'Could not create the hashedPassword'});
				}

				
			} else {
				callback(400,{'Error' : 'A user with that phone number already exists'});
			}
		});
		
	} else {
		callback(400,{'Error' : 'Missing required fields'});
	}
};

//Users - GET
// Required data : phone
// Optional data : none

handlers._users.get = function(data,callback){
	//Check that phone number is valid
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	console.log("The phone number is : "+phone);
	if(phone){
		//Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		console.log("===========The headers token is" + token);
		//Verify the token for the phone number
		handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
			//Only authenticated user can gets it's information
			if(tokenIsValid) {
				_data.read('users',phone,function(err,data){
					if(!err && data) {
						//Remove the hashed password from the user object . As we dont want to expose the password
						delete data.password;
						callback(200,data);
					} else {
						console.log(err);
						callback(400,{'Error' : 'A user does not exists'});
					}
					});
			} else {
				callback(400,{'Error' : 'Missing required tokens in headers'});
			}
		});
	} else {
		callback(400,{'Error ' : 'Missing required fields'});
	}
};

//Users - PUT
handlers._users.put = function(data,callback){
	//Get the phone number as key to decide which files needs to be modified
	
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	//Get the details which needs to be modified
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
	
	//Error if phone is invalid
	if(phone) {
		//Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		//Verify the token for the phone number
		handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
			if(tokenIsValid){

			} else {
				callback(503,{'Error' : 'Not a valid token to modify the data'});
			}
		});
		// Error if nothing is sent to update
		if(firstName || lastName || password) {
			//Lookuup the user
			_data.read('users',phone,function(err,userData){
				if(!err && userData) {
					//Update the fields necessay
					//for change in firstname
					if(firstName) {
						userData.firstName = firstName;
					}
					//for change in lastname
					if(lastName) {
						userData.lastName = lastName;
					}
					//for change in passowrd
					if(password) {
						userData.hashedPassword = helpers.hash(password);
					}

					//Store the new object
					_data.update('users',phone,userData,function(err){
						if(!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500,{'Error' : 'Could not update the user'});
						}
					});
				} else {
					callback(400,{'Error' : 'Specified user does not exists'});
				}
			});
		} else {
			callback(400,{'Error' : 'Missing fields to update'});
		}
	} else {
		callback(400,{'Error' : 'Missing required fields'});
	}
};

//User -DELETE
// Required field is phone
// @TODO : Allow only authenticated user to delete his data
handlers._users.delete  = function(data,callback){
	//Get the phone number as key to decide which files needs to be modified
	
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone) {
		//Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		//Verify the token for the phone number
		handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
			//Only authenticated user can delete it's information
			if(tokenIsValid) {
				data.read('users',phone,function(err,data){
				if(!err && data) {
					//delete the user
					_data.delete('users',phone,function(err){
						console.log("==================coming here =======================");
						if(!err) {
							callback(200);
						} else {
							callback(400,{'Error' : 'Could not delete user'});
						}
					});
				} else {
					console.log(err);
					callback(400,{'Error' : 'A user does not exists'});
				}
			});
			} else{
				callback(403,{'Error' : 'Missing required tokens from headers'});
			}
		});	
	} else {
		callback(400 , {'Error' : 'Missing required field'});
	}
};


//TOKENS
handlers.tokens = function(data,callback){
	var acceptableMethods = ['post','get','put','delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._tokens[data.method](data,callback);
	} else {
		// returning 405 that method is not available
		callback(405);
	}
};

//container for the token handlers
handlers._tokens = {};

//TOKENS - GET
// Required data : Id
// Oprional data : none
handlers._tokens.get = function(data,callback) {
	//Check that token id is valid
	var tokenId = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(tokenId) {
		//Lookup the token 
		_data.read('tokens',tokenId,function(err,tokenData){
			if(!err && tokenData) {
				callback(200,tokenData);
			} else {
				callback(400,{'Error' : 'Unable to find the specified token'});
			}
		});
	} else {
		callback(400,{'Error' : 'Missing required fields'});
	}
};


//POST
// Required data : phone and password
// Optional  data : None
handlers._tokens.post = function(tokenData,callback) {
	var phone = typeof(tokenData.payload.phone == 'string') && tokenData.payload.phone.trim().length == 10 ? tokenData.payload.phone.trim() : false;
	var password = typeof(tokenData.payload.password == 'string') && tokenData.payload.password.trim().length > 0 ? tokenData.payload.password.trim() : false;
	if(phone && password) {
		// Lookup the user who matches that phone number
		_data.read('users',phone,function(err,data){
			if(!err && data) {
				// Hash the sent password and compared with stored password
				var hashedPassword = helpers.hash(password);
				if(hashedPassword == data.password) {
					// If valid create a token with random name and set expiration date 1 hr in future from now
					var tokenId = helpers.createRandomString(20);
					var expires = Date.now() + 1000*60*60;
					var tokenObject = { 
						'phone'   : phone,
						'id'      : tokenId,
						'expires' : expires
					};
					//Store the token 
					_data.create('tokens',tokenId,tokenObject,function(err){
						if(!err) {
							callback(200,tokenObject);
						} else {
							callback(400,{'Error' : 'Could not create the token'});
						}
					});
				} else {
					callback(400,{'Error' : 'Password did not match with specified user '});
				}
			} else {
				callback(404,{'Error' : 'Could not find the Specified user'});
			}
		});
	}  else {
		callback(404,{'Error' : 'Missing required fields'});
	}
};

//PUT
//Required : id, extend
//Optinal data : None
handlers._tokens.put = function (data,callback) {
	var tokenId = typeof(data.payload.tokenId == 'string') && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : false;
	var extend = typeof(data.payload.extend == 'boolean') && data.payload.extend == true ? true : false;
	console.log("Hey Guys I am coming till here"+tokenId+"---"+extend);
	if(tokenId && extend) {
		// Lookup the token
		_data.read('tokens',tokenId,function(err,tokenData){
			if(!err && tokenData) {
				// Check if token expired or not
				if(tokenData.expires > Date.now()) {
					//update the token expiry date
					tokenData.expires = Date.now() + 1000*60*60;
					// Store the new update
					_data.update('tokens',tokenId,tokenData,function(err){
						if(!err) {
							callback(200);
						} else {
							callback(400,{'Error' : 'Could not able to update the token data'});
						}
					});
				} else {
					callback(500,{'Error' : 'Could not extend the expiration as the token is not expired'});
				}
			} else {
				callback(400,{'Error' : 'Token not found'});
			}
		});
	} else {
		callback(400,{'Error' : 'Missing required fields'});
	}
};

//DELETE
//Required : tokenId
//Optional : None
handlers._tokens.delete = function (data,callback) {
	//Check that token id is valid
	var tokenId = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(tokenId) {
		//Check the token is valid
		_data.read('tokens',tokenId,function(err,tokenData){
			if(!err && tokenData) {
				//Once there is validation of token exists , now delete the specified tokens
				_data.delete('tokens',tokenData.id,function(err){
					if(!err){
						callback(200,{'Success':'Successfully deleted the token'});
					} else {
						callback(400,{'Error' : 'Could not able to delte the speciifed token'});
					}
				});
			} else {
				callback(400,{'Error' : 'Could not able to find the token object with this tokenId'});
			}
		});
	} else {
		callback(400,{'Error' : 'Missing reqired fields'});
	}

};

//Verify if a given token id is valid for the user we are checking against
handlers._tokens.verifyToken = function(id,phone,callback) {
	//Lookup the token
	_data.read('tokens',id,function(err,tokenData){
		if(!err && tokenData) {
			//Check that token of the given is not expired
			console.log(tokenData.phone+" Phone: "+phone+" __ " + tokenData.expires + " Time: " + Date.now());
			if(tokenData.phone == phone && tokenData.expires < Date.now()){
				callback(true);
			} else {
				//Not a valid token
				callback(false);
			}
		} else {
			//Missing some required fields
			callback(false);
		}
	});
};


//sample handler
handlers.sample = function(data,callback){
	callback(200,{'name':'sample handler'});
};

//Ping handler
handlers.ping=function(data,callback)
{
	callback(200);
};

handlers.NotFound = function(data,callback)
{
	callback(404);
};

//Export the module
module.exports = handlers;
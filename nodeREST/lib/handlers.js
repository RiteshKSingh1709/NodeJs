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
	var phone = typeof(data.payload.phone == 'string') && data.payload.phone.length == 10 ? data.payload.phone : false;
	var password = typeof(data.payload.password == 'string') && data.payload.password.length > 0 ? data.payload.password : false;
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
						'tosAgreement' : true,
					}

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
handlers._users.get = function(data,callback){

};

//Users - PUT
handlers._users.put = function(data,callback){

};

//User -DELETE
handlers._users.delete  = function(data,callback){

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
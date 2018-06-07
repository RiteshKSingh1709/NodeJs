/*
*	Library for data
*
*
*/

//dependencies
var fs = require('fs');
var path  = require('path');
var helpers = require('./helpers');

// container module to exported
var lib = {};

//BASE directory for data folder
lib.baseDir = path.join(__dirname,'/../.data/');

//write data to file
lib.create = function(dir,file,data,callback){

	//Open the file for writing
	fs.open(lib.baseDir+dir+'\/'+file+'.json','wx',function(err,fileDescriptor){
		if(!err && fileDescriptor){
			//Convert the json to string
			var stringData = JSON.stringify(data);

			//Write the file and close it
			fs.writeFile(fileDescriptor,stringData,function(err){
				if(!err){
					fs.close(fileDescriptor,function(err){
						if(!err) {
							callback(false);
						} else {
							callback("Couldn't able to close the file");
						}
					});
				} else {

					callback("Not able to write in the file");
				}
			});

		} else{
			callback("Couldn't create the new file "+err);
		}
	});

};

//Read data from file
lib.read = function(dir,file,callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err,data){
			if(!err && data) {
				console.log("the data is " +data);
				var parsedData = helpers.parseJsonToObject(JSON.stringify(data));
				callback(err,JSON.parse(parsedData));
			} else {
				callback(err,data);	
			}
			
	});
};

//Update the data inside a file
lib.update = function(dir,file,data,callback){
//Open the file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
		if(!err && fileDescriptor) {
			//Convert the data to string
			var stringData = JSON.stringify(data);

			//Truncate the file
			fs.truncate(fileDescriptor,function(err){
				if(!err) {
					//Write to the file and close it
					fs.write(fileDescriptor,stringData,function(err){
						if(!err) {
							fs.close(fileDescriptor,function(err){
								if(!err) {
									callback(false);
								} else {
									callback("Error in closing the existing file");
								}
							});
						} else {
							callback("Error while writing to the file");
						}
					});
				} else {
					callback("Could not able to truncate the file");
				}
			});
		} else {
			console.log("Unable to open the file");
		}
	});
};

//delete the data
lib.delete = function(dir,file,callback){
	fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
		if(!err) {
			console.log("=========== In delete lib =============");
			callback(false);
		} else {
			console.log(err);
			callback("Unable to delete the file");
		}
	});
};
//Export the module
module.exports = lib;
/*
*   RESTfull API
*
*/


var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var https = require('https');
var fs = require('fs');
//import config file
var config = require('./config');
console.log(config);

// create the HTTP Server
var httpServer = http.createServer(function(req,res){
 	unifiedServer(req,res);
});

//listen the HTTP port 
httpServer.listen(config.httpPort,function(){
	console.log("The HTTP server is listening at port " + config.httpPort + " in " + config.envName + " mode" );
});


//https option needs to be passed for creating HTTPS server
var httpsOption = {
	'key' : fs.readFileSync('../https/key.pem'),
	'cert' : fs.readFileSync('../https/cert.pem'),
};
var httpsServer = https.createServer(httpsOption,function(req,res){
	unifiedServer(req,res);
});

//listen the HTTPS port 
httpServer.listen(config.httpsPort,function(){
	console.log("The HTTPS server is listening at port " + config.httpsPort + " in " + config.envName + " mode" );
});

//unified server logic same for HTTP and HTTPS
var unifiedServer = function(req,res){

	//get the url and parse
	// url.parse take two param one the requested url and "true" is for parsing query string
	var parsedUrl  = url.parse(req.url,true);

	//get the pathname and strip extrenous slashes
	var path = parsedUrl.pathname;
	//replace the slashe with no space
	var trimmedUrl = path.replace(/^\/+|\/+$/g,'');
	//get the queryString in the requested path
	var queryStringObject = parsedUrl.query;
	console.log(queryStringObject);
	//get the methd which that request came to the server
	var method = req.method.toLowerCase();
	//get the header as object
	var header = req.headers;
	//get the payload
	var decoder = new StringDecoder('utf-8');
	var buffer = '';


	//get the data from request object
	req.on('data',function(data){
		buffer += data;
	});
	// when data is ended. This will be called when there will be no payload also that time data will be empty
	req.on('end',function()
	{
		//end the buffer
		buffer += decoder.end();

		//choose the handler this request should go
		var choosenHandler = typeof(router[trimmedUrl]) !== 'undefined' ? router[trimmedUrl] : handler.NotFound;

		//condtruct the data object that send to handler
		var data = {
			'trimmedPath' : trimmedUrl,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : header,
			'payload' : buffer,
		}

		choosenHandler(data,function(statusCode,payload){
			//use the status code called by handler or deault
			var statusCode = typeof(statusCode) =='number' ? statusCode : 404;

			//use the payload called by handler or default
			var payload = typeof(payload) == 'object' ? payload : {};

			//convert the payload object into string
			var payloadString = JSON.stringify(payload);
			console.log(payloadString);
			
			//returnt the response 
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);

			res.end(payloadString);

			//log the requested path with method name and query String (if any)
			console.log("The request path : "+trimmedUrl+ " and the method name is : "+method+" with query string : ",queryStringObject);
			//console.log("The request header is :",header);
			//console.log("the payload is :" , buffer);

		});

	});


};

//Define the handler
var handler = {};

//sample handler
handler.sample = function(data,callback){
	callback(200,{'name':'sample handler'});
};

handler.NotFound = function(data,callback)
{
	callback(404);
};

//setting up the router
var router = {};
router.sample = handler.sample;

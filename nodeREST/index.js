/*
*   RESTfull API
*
*/


var http = require('http');
var url = require('url');


// create the Server
var createServer = http.createServer(function(req,res){

	//get the url and parse
	// url.parse take two param one the requested url and "true" is for parsing query string
	var parsedUrl  = url.parse(req.url,true);

	//get the pathname and strip extrenous slashes
	var path = parsedUrl.pathname;
	//replace the slashe with no space
	var trimmedUrl = path.replace(/^\/+|\/+$/g,'');

	//get the methd which that request came to the server
	var method = req.method.toLowerCase();


	//send the response
	res.end("Hello World\n");

	//log the requested path with method name
	console.log("The request path : "+trimmedUrl+" and the method name is : "+method);
});

//listen the port 

createServer.listen(3000,function(){
	console.log("The server is listening at port 3000");
});
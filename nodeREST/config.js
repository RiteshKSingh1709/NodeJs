/*
*	configuration for envrionment specific
*
*/

var envrionments = {};

//envrionment specific to statgis
envrionments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging'
};

//envrionment specific to production
envrionments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production'
};

//get the current envrionment using command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


//export the crrent environment from the above or default to staging
var currentEnvironmentToExport  = typeof(envrionments[currentEnvironment]) == 'object' ? envrionments[currentEnvironment] : envrionments.staging;

// 
module.exports = currentEnvironmentToExport;

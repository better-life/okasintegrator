var Integrator = require('./lib/index');
var integrator = new Integrator({
	connectionString:"",
	parserPath:__dirname+"/parser/"
});

var provider_id = "1", entity="CENTERS";

integrator.syncNow(provider_id,entity,function(err){
	if(err)
		console.log(err);
	console.log('Callback from app.js');
})
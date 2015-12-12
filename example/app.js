var Integrator = require('okasintegrator');
var integrator = new Integrator({
	connectionString:"", //mongodb connection uri
	parserPath:__dirname+"/parser/", //path to folder where all the parsers are kept
	cronTime:'0 0 0-23 * * *', //optional defaults to every 1 hour.
});

var provider_id = "1", entity="CENTERS";

/*METHOD 1*/
integrator.syncNow(provider_id,entity,function(err){
	if(err)
		console.log(err);
	console.log('Callback from app.js');
})
/*METHOD 2*/
integrator.init();

/*Sample schema for IntegratorConfigs collection*/
/*
{
	provider_id:"1",
	parser:"mylab",
	entities:[{
		active:true,
		syncHours:[10],
		name:"TEST",
		url:""
	},
	]
}
*/
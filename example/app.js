var Integrator = require('okasintegrator');
var integrator = new Integrator({
	connectionString:"", //mongodb connection uri
	parserPath:__dirname+"/parser/" //path to folder where all the parsers are kept
});

var provider_id = "1", entity="CENTERS";

integrator.syncNow(provider_id,entity,function(err){
	if(err)
		console.log(err);
	console.log('Callback from app.js');
})

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
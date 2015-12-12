
module.exports = {
	TEST:function(provider_id,url,cb){
		console.log('Inside mylab')
		console.log('Provider id '+provider_id);
		console.log('URL '+ url);
	},
	TESTRATES:function(provider_id,url,cb){

	},
	CENTERS:function(provider_id,url,cb){
		console.log('Inside mylab')
		return cb();
	},
	DOCTORS:function(){

	},
	STAFF:function(){

	},
	REPORTHEADERS:function(){

	},
	REPORTDETAILS:function(){

	},
	POSTORDER:function(){

	},
	ORDERS:function(){

	},
	UPDATEORDER:function(){

	},
	POSTPAYMENT:function(){

	}
}
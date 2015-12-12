var async = require('async');

process.on('message',function(msg){
  this.start = function(msg){
    var name = msg.name,
    parser = msg.parser,
    provider_id = msg.provider_id,
    url = msg.url;

    async.waterfall([
      function(nextfunc){
        var handler = require("../"+parser);
        handler[name](provider_id,url,nextfunc);
      }
    ],function(e,result){
      if(e){
        console.log("childprocessor.js: " + e.message + "\n" + e.stack);
        return process.send(false)
      }
      process.send(true);
    })
  }
  this._init = function(){
    if(msg){
      this.start(msg)
    }
    else{
        console.log("processitem.js: content empty. Unable to start.");
    }
  }.bind(this)()
})

process.on('uncaughtException',function(err){
    console.log("processitem.js: " + err.message + "\n" + err.stack);
})
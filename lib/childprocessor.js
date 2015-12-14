var async = require('async');
var mongoose = require('mongoose');

process.on('message',function(msg){
  this.start = function(msg){
    var name = msg.name,
    parser = msg.parser,
    provider_id = msg.provider_id,
    url = msg.url,
    parserPath = msg.parserPath;

    async.waterfall([
      function(nextfunc){
        var handler = require(parserPath+parser);
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
      mongoose.connect(msg.connectionString);
      mongoose.connection.on('error', function() {
          console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
      });
      this.start(msg)
    }
    else{
        console.log("childprocess : content empty. Unable to start.");
    }
  }.bind(this)()
})

process.on('uncaughtException',function(err){
    console.log("childprocess : " + err.message + "\n" + err.stack);
})
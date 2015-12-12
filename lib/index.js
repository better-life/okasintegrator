var async = require('async');
var DB = require('./mongodb');
var _ = require('lodash');
var moment = require('moment-timezone');
var childProcess = require("child_process");
var CronJob = require('cron').CronJob;

/*
 * Options:
 * - cronTime: cronTime for running integrator service. defaults to every 1 hour.
 * - connectionString: The MongoDB connection string. defaults to localhost test db.
 */
 
module.exports = function(options) {

  options = options || {};

  var loaded = false;
  var db = new DB(options);

  var COLLECTION = 'IntegratorConfigs';
  var LOG_COLLECTION = 'IntegratorConfigLogs';
  
  this.init = function(){
    var job = new CronJob({
      cronTime: options.cronTime || '0 0 0-23 * * *',
      onTick: function() {
        console.log('Sync Master initialized');
        initJobs();
      },
      start: false,
      timeZone: 'Asia/Calcutta'
    });
    job.start();
  }

  function initJobs(){
    var currentHour = parseInt( moment().tz("Asia/Calcutta").format('HH') );
    async.waterfall([
      function(nextfunc){
        //load the db
        load(nextfunc);
      },
      function(nextfunc){
        //search for active jobs in collection
        var search = {};
        search['entities'] = { $elemMatch: { active: true, syncHours:{ $in : [currentHour] } } };
        db.find(COLLECTION, search,nextfunc);
      },
      function(providers,nextfunc){
        async.each(providers,function(provider,nextprovider){
          processProvider(provider,currentHour,nextprovider);
        },function(err){
          return nextfunc(err)
        })
      }
      ],function(err){
        close();
        console.log(err || 'Sync complete');
    })
  }

  function processProvider(providerObj,currentHour,cb){
    var entities = providerObj.entities.filter(function(o){
      if( o.active && _.includes(o.syncHours, currentHour) )
          return true;
      })
    async.eachSeries(entities,function(o,next){ 
      executeJob({
          provider_id:providerObj.provider_id,
          name:o.name,
          parser:providerObj.parser,
          url:o.url
        },next);
    },function(e){ return cb(e) })
  }

  function executeJob(data,cb){
    console.log('Processing '+data.name);
    console.log('parser '+data.parser);
    console.log('Url '+data.url);
    data.parserPath = options.parserPath;
    this._childprocess = childProcess.fork("./childprocessor",{cwd:__dirname});
    this._childprocess.on('message', function(msg){
      console.log("recv'd message from background process.");
      console.log(msg);
    }.bind(this))
    this._childprocess.send(data);
    return cb(null);
  }

  function load(cb) {
    if (loaded) {
      console.warn('Integrator already loaded. Not reloading');
      return cb();
    }
    db.connect(function(err) {
      if (err) {
        cb(err);
        return;
      }
      db.loadCollection(COLLECTION, function(err) {
        if (err) {
          cb(err);
          return;
        }
        db.loadCollection(LOG_COLLECTION,function(err){
          if (err) {
            cb(err);
            return;
          }
          loaded = true;
          cb(null);
        })
      });
    });
  };

  this.syncNow = function(provider_id,entity,cb){
    async.waterfall([
        function(nextfunc){
          load(nextfunc)
        },
        function(nextfunc){
          var search = {};
          search['provider_id'] = provider_id;
          search['entities'] = { $elemMatch: { name: entity } };
          db.findOne(COLLECTION, search,nextfunc)
        },
        function(providerObj,nextfunc){
          if(!providerObj) return nextfunc('provider not found');
          var entityObj = _.find(providerObj.entities,{ name: entity })
          if(entityObj && entityObj.url && providerObj.parser){
            executeJob({
              provider_id:providerObj.provider_id,
              name:entityObj.name,
              parser:providerObj.parser,
              url:entityObj.url
            },nextfunc);
          }else{
            return nextfunc("Entity or URL or Parser not found");
          }
        }
      ],function(err){
        close();
        return cb(err);
    })
  }

  function close(cb) {
    loaded = false;
    db.disconnect(cb);
  };
}
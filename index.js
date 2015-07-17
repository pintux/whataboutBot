var debug = require('debug')('index');
var async = require('async');

var userConf = require('./userConf');
var Bot = require('./bot/whataboutBot');
var apps = require('./apps.json');


var bot = new Bot(userConf);

function update(){
    debug("---------------------");
    bot.getUpdates(function(err, updates){
      async.each(updates, function(update, cb){
        bot.processMessage(update, cb);
      }, function(err){
        if(err) debug(err);
      });

    });

}
debug("--------- WHAT ABOUT TELEGRAM BOT ------------");
debug('Starting Bot');
debug('Available apps: ', apps);
debug("----------------------------------------------");
//loop
setInterval(update, userConf.updatesInterval || 1000);

var http = require('request');
var FormData = require('form-data');
var debug = require('debug')('bot');
var util = require('util');


var generalConf = require('../generalConf.json');
var apps = require('../apps.json');



function Bot(config){
    this.offset = 0;
    this.username = config.username;
    this.name = config.botName;
    this.token = config.token;
}

// Polling!
Bot.prototype.getUpdates = function(cb){

  var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.getUpdates + '?offset='+this.offset;
  debug('getUpdates -> ',reqURL);
  var self = this;
  http.get(reqURL, function(err, response, body){
    debug('Response: ' + util.inspect(body));
    if (!err && response.statusCode === 200) {
        var updates = JSON.parse(body);
        try {
          if(updates.ok && updates.result.length > 0){
            self.offset = updates.result[updates.result.length-1].update_id+1;
          }
          //returns a JSON
          return cb(null, updates.result);
        } catch (e) {
          debug(e);
          return cb(e, null);
        }
    }
    else return cb(err, null);
  });
};

//Sends a TEXT message to a chat
Bot.prototype.sendTextMessage = function(chatId, message, cb){
    var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.sendMessage + '?chat_id=' + chatId + '&text='+message;
    http.post(reqURL, function(err, response, body){
      debug('sendTextMessage Response: ' + util.inspect(body));
      if (!err && response.statusCode === 200) {
          var message = JSON.parse(body);
          return cb(null, message);
      }
      else return cb(err, null);
    });
};

//Sends a PHOTO content from URL to a chat
Bot.prototype.sendPhotoMessage = function(chatId, photoURL, caption, cb){
    var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.sendPhoto;
    debug('Sending photo to: ', reqURL);
    var formData = new FormData();
    formData.append('photo', http.get(photoURL));
    formData.append('chat_id', chatId);
    if(caption !== '') {
      formData.append('caption', caption);
    }

    formData.submit(reqURL, function(err, response) {
      if(!err && response.statusCode === 200) {
        cb(null, response);
      } else {
        cb(err, null);
      }
    });

};

//processes the message using the installed apps
Bot.prototype.processMessage = function(update, cb){
  var message = update.message.text;
  if(message.indexOf('/')===0){
    var command = message.split(' ');
    var app = command[0];
    debug('app: ',app);
    debug('apps', apps);

    if (app === '/start') return cb();
    //help request command
    if (app === '/help'){
      var helpMsg = 'Available commands: \n\n';
      for (app in apps){
        helpMsg += app + '  ' + apps[app].help + '\n';
      }
      this.sendTextMessage(update.message.chat.id, helpMsg, function(err, message){
        return cb();
      });
    } else {
            var param = command[1];
            var self = this;
            if (app in apps){
                //call app's run()
                debug('Calling APP: ', app);
                require('../apps/'+apps[app].file)(param, update.message.chat, function(err, result){
                  if(!err){
                    debug('Sending a message of type: ', result);
                    //images from URL
                    //text
                    if ('text' in result){
                      self.sendTextMessage(update.message.chat.id, result.text, function(err, message){
                        if(err) debug('Error:', err);
                        return cb();
                      });
                    }
                    else if ('photo' in result) {
                      debug('Sending a photo');
                      self.sendPhotoMessage(update.message.chat.id, result.photo, result.caption, function(err, message){
                        if(err) debug('Error:', err);
                        return cb();
                      });

                    }
                    //TODO: add documents and files support, ...
                  }
                });

            } else {
              self.sendTextMessage(update.message.chat.id, "Sorry, I can't understand...", function(err, message){
                return cb();
              });
            }
          }
  }
};



module.exports = Bot;

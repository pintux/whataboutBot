var http = require('request');
var FormData = require('form-data');
var debug = require('debug')('bot');
var util = require('util');
var fs = require('fs');


var generalConf = require('../generalConf.json');
var apps = require('../apps.json');



function Bot(config){
    this.offset = 0;
    this.username = config.username;
    this.name = config.botName;
    this.token = process.env.TOKEN;
    this.allowedUsers = config.allowedUsers || false;
}

// Polling (MODE=pull)
Bot.prototype.getUpdates = function(cb){

  var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.getUpdates + '?offset='+this.offset;
  var self = this;
  http.get(reqURL, function(err, response, body){
    debug('Response: ' + util.inspect(body));
    if (!err && response.statusCode === 200) {
        var updates = JSON.parse(body);

        try {
          if(updates.ok && updates.result.length > 0){
            self.offset = updates.result[updates.result.length-1].update_id+1;
          }

          //if allowedUsers == false, then ALL users can chat with the bot
          if(!self.allowedUsers){
            return cb(null, updates.result);
          }
          else{
            //filter messages by allowedUsers
            return cb(null, updates.result.filter(function(value){
	                          return (self.allowedUsers.indexOf(value.message.from.username) !== -1);
                        }));
          }

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
    //debug('Sending photo to: ', reqURL);
    var formData = new FormData();
    formData.append('photo', http.get(photoURL));
    formData.append('chat_id', chatId);
    if(caption !== '') {
      formData.append('caption', caption);
    }

    formData.submit(reqURL, function(err, response) {
      //debug(err, response);
      if(!err && response.statusCode === 200) {
        cb(null, response);
      } else {
        cb(err, null);
      }
    });

};

//Sends a PHOTO content from a Stream to a chat
Bot.prototype.sendPhotoStreamMessage = function(chatId, stream, caption, cb){
    var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.sendPhoto;
    debug('Sending streamed photo to: ', reqURL);
    var formData = new FormData();
    var filename = process.env.PWD + '/' +stream;
    debug('Filename:', filename);
    formData.append('photo', fs.createReadStream(filename));
    formData.append('chat_id', chatId);
    if(caption !== '') {
      formData.append('caption', caption);
    }
    fs.stat(filename, function(err, stats){
      //sets content-length header, without it form-data doesn't work
      formData.getHeaders({"Content-Length": stats.size});
      formData.submit(reqURL, function(err, response) {
        //in any case delete file
        fs.unlink(filename, function(error){
          if(!err && response.statusCode === 200) {
            cb(null, response);
          } else {
            cb(err, null);
          }
        });
      });
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
                debug('file to import: ', '../apps/'+apps[app].file);
                require('../apps/'+apps[app].file)(param, update.message.chat, function(err, result){
                  if(!err){
                    debug('Sending a message of type: ', result);

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
                    else if ('photoStream' in result) {
                      debug('Sending a photo stream');
                      self.sendPhotoStreamMessage(update.message.chat.id, result.photoStream, result.caption, function(err, message){
                        if(err) debug('Error:', err);
                        return cb();
                      });

                    }
                    //TODO: add documents and files support, ...
                  }
                  else{
                    debug('ERROR ', err);
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

//Sets a webhook for this bot (MODE=push)
Bot.prototype.setWebhook = function(url, cb){
    var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.setWebhook;
    debug('Registering a webook to URL:', url);
    var formData = new FormData();
    var certFilename = process.env.PWD + '/certs/certificate.pem';

    fs.exists(certFilename, (exists) => {
       debug('Certificate at:', certFilename, 'exists: ', exists);
       if(exists){

                formData.append('certificate', fs.createReadStream(certFilename));
                formData.append('url', url);
                fs.stat(certFilename, function(err, stats){
                    //sets content-length header, without it form-data doesn't work
                    formData.getHeaders({"Content-Length": stats.size});
                    debug('Sending webhook registration...');
                    formData.submit(reqURL, function(err, response) {
                        debug("Webhook registration response status:", response.statusCode);

                        if(!err && response.statusCode === 200) {
                            var body=[];
                            response.on('data', function(chunk) {
                                    body.push(chunk);
                                }).on('end', function() {
                                    body = Buffer.concat(body).toString();
                                    debug("Webhook registration response BODY:", body);
                                    cb(null, response);
                             });

                        } else {
                            cb(err, null);
                        }
                    });
                });
       } else {
            debug('ERROR, certificate not specified');
            cb('Certificate not provided', null);
       }

    });

};

//Unsets webhooks for this bot sending an empty URL
Bot.prototype.unsetWebhook = function(cb){
    var reqURL = generalConf.APIBASEURL + this.token + '/'+generalConf.setWebhook + '?url=';
    debug('Unsetting any webook, calling GET ',reqURL);
    http.get(reqURL, function(err, response, body){
        if(!err && response.statusCode === 200) {
            cb(null, response);
        } else {
            debug('Error in unsetting webhooks:', err);
            cb(err, null);
        }

    });

};


module.exports = Bot;

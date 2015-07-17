var http = require('request');
var debug = require('debug')('apps:test');

//HOW to add a new app to the bot:
// 1. write a file like this one, declaring a run() function.
//    param, is the second text written in a chat after the command. E.g., /test abc, in this case 'abc' is the param
//    chat, is always the chat element coming from Telegram API
//    cb, the callback to call with the results of the run (or error). In case of success, you must call the callback with a JSON as follows:
//        {"text": YOUR_TEXT_MESSAGE}
//        More types other than 'text' are coming...
// 2. add an entry in the apps.json file, specifying the command to activate this app (i.e., '/test') and the name of the app file (i.e., 'test') and the help message
//      which corresponds to this file name.
//
// That's all, starting your Bot results in installing the app.

function run(param, chat, cb){
    var message = "This is a TEST, " + chat.first_name + " and... yes I'm working! ;)";
    cb(null, {'text':message}); //supported types is: text
}

//mandatory, don't forget it ;)
module.exports = run;

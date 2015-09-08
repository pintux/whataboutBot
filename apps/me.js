var http = require('request');
var debug = require('debug')('apps:me');

function run(param, chat, cb){
    var message = "Hello dear " + chat.first_name + ' DOT ' + chat.last_name;
    cb(null, {'text':message});
}

module.exports = run;

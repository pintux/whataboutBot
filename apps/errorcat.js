var http = require('request');
var debug = require('debug')('apps:error-cat');

//It uses the nice HTTP Status cats API https://http.cat/

function run(errorCode, chat, cb){

  var errorCode = errorCode || '404';
  var reqURL = 'https://http.cat/'+errorCode;
  cb(null, {'photo':reqURL, 'caption':errorCode+' cat!'});
}

module.exports = run;

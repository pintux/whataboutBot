var http = require('request');
var debug = require('debug')('apps:error-cat');

//It uses the nice HTTP Status cats API https://http.cat/

function run(statusCode, chat, cb){

  var status = statusCode || '404';
  var reqURL = 'https://http.cat/' + status + '.jpg';
  cb(null, {'photo':reqURL, 'caption':status+' cat'});
}

module.exports = run;

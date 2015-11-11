var http = require('request');
var util = require('util');
var fs = require('fs');
var debug = require('debug')('apps:QR');
var qr = require('qr-image');
var uuid = require('uuid');


function run(qrPayload, chat, cb){

  debug('Generating QR for:',qrPayload);
  var codeStream = qr.image(qrPayload, {type:'png'});
  var fileName = uuid.v1();
  codeStream.pipe(fs.createWriteStream(fileName + '.png'));
  codeStream.on('end', function() {
    cb(null, {'photoStream':fileName+'.png', 'caption':'your QR-Code'});
  });
  

}

module.exports = run;

'use strict'

var debug = require('debug')('index');
var async = require('async');

var userConf = require('./userConf');
var Bot = require('./bot/whataboutBot');
var apps = require('./apps.json');

const https = require('https');
const fs = require('fs');
const ip = require('ip');
const url = require('url');


var bot = new Bot(userConf);

function startPullPolling(){
    bot.getUpdates(function(err, updates){
        async.each(updates, function(update, cb){
            bot.processMessage(update, cb);
        }, function(err){
            if(err) debug(err);
        });
    });
}


function startPushServer(port){

    const options = {
        key: fs.readFileSync('certs/privatekey.key'),
        cert: fs.readFileSync('certs/certificate.pem')
    };

    var token = process.env.TOKEN;
    //set a webhook.
    //For security, a valid POST URL to receive PUSH notifications contains the token, as only Telegram knows it.
    //so we can reasonable sure it's the caller.
    let webhookURL = 'https://' + ip.address() + ':' + port + '/' + token;
    bot.setWebhook(webhookURL, function(err, output){
        if(err) {
            debug('Error in setting webhook: ', err, '. Exiting...');
            process.exit(1);
        }
        else{                
                https.createServer(options, function(req, res){ 
                    var parsedURL = url.parse(req.url);  
                    debug("Webhook called: ",parsedURL, " by: ", req.method);                 
                    if (req.method === 'POST' && parsedURL.pathname.indexOf(token) > -1) {
                        debug("Webhook called by POST and correct URL path. Processing request...");
                        var body = [];
                        req.on('data', function(chunk) {
                                body.push(chunk);
                        }).on('end', function() {
                                body = Buffer.concat(body).toString();
                                debug("Request BODY:", JSON.parse(body));
                                bot.processMessage(JSON.parse(body), function(err, out){
                                    
                                    if(err){
                                        debug('Error processing message: ',err);
                                    }                                   
                                    
                                });                                
                        });                                             
                        
                    }
                    res.writeHead(200);
                    res.end();

                }).listen(port);
        }
    });
}


debug("--------- WHAT-ABOUT-(TELEGRAM) BOT ------------");
debug("Bot IP Address: ", ip.address());
debug('Starting Bot');
debug('Available apps: ', apps);
debug("------------------------------------------------");

if (!process.env.TOKEN || process.env.TOKEN === undefined){
    console.log('ERROR: Telegram Bot Token not specified');
    console.log('Usage:');
    console.log('TOKEN=<BOT TOKEN> [MODE=pull|push] [PORT=<push port>] node index.js');
    console.log('TOKEN: the Telegram Bot API Token');
    console.log('MODE: optional, enter pull for polling or push to ue webhooks; default is pull.');
    console.log('PORT: optional, https port to listen to for push messages. Used only if MODE=push, defaults to 8443');
}
else{

    const mode = process.env.MODE || 'pull';

    if(mode === 'pull'){
        //polling loop
        //unset any webhook
        bot.unsetWebhook(function(err, output){
            if(err) debug('Error in resetting webhooks: ', err);
            else debug('webhooks unset', output.body);
        });
        debug('Starting Bot in PULL mode, starting polling...')
        setInterval(startPullPolling, userConf.updatesInterval || 1000);
    }
    else{
        //starting https server for push (webhook mode)
        const port = process.env.PORT || 8443;
        debug('Starting Bot in PUSH mode, HTTPS Webhook... port:',port);
        startPushServer(port);

    }
}

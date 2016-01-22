WhatAboutBot - A configurable, minimal Telegram Bot
==================================


About
-----

A simple Telegram based Bot.
Intended to be configurable and extendable for your aims writing little code snippets
named "apps".

From Telegram Bots page: *"Bots are special Telegram accounts designed to handle messages automatically. Users can interact with bots by sending them command messages in private or group chats"*

Version
-------
0.4.0


Requirements
------------

- [node.js](http://nodejs.org), tested with node.js v. 4.x.x and 5.x.x
- an existing Telegram Bot, follow [Telegram Bots](https://core.telegram.org/bots) documentation to create yours. Bot name and Telegram API Token are mandatory


Running the Bot
---------------

1. run `npm install` command inside the root directory of the project
2. edit the `userConf.json` file and enter your telegram API Token and required other details about your existing Bot
3. run `npm start` command
(run `DEBUG=* npm start` for a debug log on standard output)


Directories Structure & Main Files
----------------------------

`whataboutBot`

---- `apps`: contains all the Bot supported apps (see below how to create and add a new app)

---- `bot`: contains the Bot core libs. Current version of the Bot runs in pull mode: it polls the Telegram Bot APIs to get new messages. Future versions will work also in push mode, to receive updates from Telegram when needed

`apps.json`: lists all the available and configured apps. JSON keys are the commands supported by the Bot, where related JSON values are the name of the correspondent app file (contained in `apps` folder)

`generalConf.json`: Telegram BOT API general configuration (in most cases is intended to be left unedited)

`userConf.json`: Specific Telegram BOT configuration. Fill in your Telegram API Token as well as the bot name and username. `updatesInterval` is the polling interval to check for updates from Telegram Bot API; `allowedUsers` is an array of Telegram username strings allowed to use this Bot. Enter `false` to let everybody use your Bot. 

`index.js`: the main file to run



Included Basic Apps
---------------------------------------------

`/test`: simple command for testing purposes

`/me`: get a simple message related to chat user

`/weather city`: get an updated summary of the weather for the specified `city` (for composed city names, like New York, write it without spaces: `newyork`); **NB**: OpenWeatherMap service now requires an APIKEY, get one [HERE](http://openweathermap.org/appid#get) AND add the key in the `apps/weather.js` file.

`/http code`: NERD-ZONE,  get a nice picture about the specified HTTP Status Code ;)

`/qr string`: generates a QR code for the provided string. A string could be a word, a number, a code, a URL without spaces.

More to come...

Extending the Bot === write and add your Apps
---------------------------------------------


**1)**  write a new (with an unique name) Javascript file like the following example, declaring a `run(param, chat, cb)` function, where:

`param`, is the second string written in a chat after the command. E.g., in `/test abc`,  `abc` is the param and will be passed automatically;

`chat`, is always the JSON chat element coming from Telegram API, it will passed automatically and it can be useful to get some info about the chat, like the telegram user name;

`cb`, the callback function to be called with the results of the run (or an error). In case of success, you must call the callback with a JSON as follows:
```javascript
{"text": "A_TEXT_MESSAGE"}
```
or
```javascript
{"photo": "AN_IMAGE_HTTP_URL", "caption":"my image caption"}
```
or
```javascript
{"photoStream": "AN_IMAGE_FILE_PATH", "caption":"my image caption"}
```

**NB**: This version supports only text and photo messages (from URL or file stream). More supported types are coming soon...

```javascript
function run(param, chat, cb){
    var message = "This is a TEST, " + chat.first_name + " and... yes I'm working! ;)";
    cb(null, {'text':message}); //supported types are: text, photo, photoStream
}

//mandatory, don't forget it ;)
module.exports = run;
```



**2)** add an entry in the `apps.json` file, specifying the command to activate this app as a key (i.e., `/test`) and as value: the name of the app `file` (i.e., `test`), corresponding to the app file name created in step 1), and the `help` message to show when user writes the `/help` command.



See existing apps for more examples.
That's all, starting your Bot results in installing the app.




Links
-----

- [Telegram Bots](https://core.telegram.org/bots)

Contributors
------------

<table><tbody>
<tr><th align="left">Antonio Pintus</th><td><a href="https://github.com/pintux">GitHub/pintux</a></td><td><a href="https://twitter.com/apintux">Twitter/@apintux</a></td></tr>

</tbody></table>


License - "MIT License"
-----------------------
Copyright (c) 2015-2016 Antonio Pintus, http://www.pintux.it

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

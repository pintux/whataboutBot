var http = require('request');
var debug = require('debug')('apps:weather');

//IMPORTANT, OpenWeathermap API KEY
var apiKey = ''; 

function run(city, chat, cb){

  var city = city || 'Cagliari';
  var reqURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&APPID='+ apiKey +'&q='+city;
  http.get(reqURL, function(err, response, body){

    if(!err && response.statusCode === 200){
          var weatherStat = JSON.parse(body);
          var message = 'Current Weather in ' +
                        weatherStat.name.toUpperCase() + ':\n\n' +
                        weatherStat.weather[0].description + '\n' +
                        'Temperature: ' +
                        weatherStat.main.temp + ' Celsius\n' +
                        'Pressure: ' +
                        weatherStat.main.pressure + ' mbar\n' +
                        'Humidity: ' +
                        weatherStat.main.humidity + '%\n\n' +
                        'Yo!';
            debug('Weather:  ' + weatherStat);
            cb(null, {'text':message}); //supported types are: text

    } else {
        debug('Error:', err);
        cb(err, null);
    }
  });
}

module.exports = run;

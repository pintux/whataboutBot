var http = require('request');
var debug = require('debug')('apps:weather');

function run(city, chat, cb){

  var city = city || 'Cagliari';
  var reqURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q='+city;
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
        cb(err, null);
    }
  });
}

module.exports = run;

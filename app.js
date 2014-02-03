/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var jsdom = require('jsdom');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
  * Configuration variables: bus stop codes & URLs
  */
/*var busStop_Potterow = '36253583';
var busStop_GiffordsPark = '36238273';
var busStop_KingsBuildings = '36245896';
var urlKingsToCentral = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36253583&busStopCode=36245896';
var urlPotterowToKings = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36253583';
var urlGiffordToKings = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36238273';*/

/**
  * Routes
  */
app.get('/', function(req, res) { 
    res.writeHead(200,{'content-type':'text/json'});
    res.end(JSON.stringify("More information on GitHub - please use correct routes")); 
});

app.get('/:from', function(req, res) {
    // NB: switch-construct didn't work, let's do it quick'n'dirty with IFs
    if (['kb','meadows','potterow','randomlongstringtoaddanotheropportunity'].join(',').indexOf(req.param('from')+',')>-1) {
        kb = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36253583&busStopCode=36245896';
        potterow = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36253583';
        meadows = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36238273';

        jsdom.env(
          eval(req.param('from')), // evil-eval
          ["http://code.jquery.com/jquery.js"],
          function (errors, window) {
            var buses = [];

            if (window.$('table.timesTable tbody tr:visible td.time a').length>0) {
                for (var i=0; i<window.$('table.timesTable tbody tr:visible td.time a').length; i++) {
                    var busNumber = window.$(window.$('table.timesTable tbody tr:visible:not(.tHeader):not(.tFooter):not(.tResult)')[i]).children().first().text();
                    busNumber = (busNumber=='C134') ? 'Uni-Shuttle' : busNumber;
                    var busDestination = window.$(window.$('tr:visible td.dest')[i]).text();
                    var busArrivalTime = window.$(window.$('tr:visible td.time a')[i]).text();
                    console.log("Bus No. ", busNumber, "to", busDestination, "departs in", busArrivalTime);

                    var bus = {number: busNumber, arrivalTime: busArrivalTime};
                    buses.push(bus);

                    if (i==(window.$('table.timesTable tbody tr:visible td.time a').length-1)) {
                        buses.sort(function(a,b) {
                            return (parseInt(a.arrivalTime)<parseInt(b.arrivalTime));
                        });
                        res.end(JSON.stringify(buses));
                    }
                }
            } else {
                res.end(JSON.stringify(buses));
            }
          }
        );
    } else {
        res.end('Sorry, we do not support this bus stop');
    }    
});

/**
  * Route used in development to test code against the official JSON-format
  */
app.get('/mock-official-api', function(req, res) {
    var buses = {
            "stopCode": "36232658",
            "stopName": "Haymarket Satio",
            "services": [
                    { "serviceName": "3", "route": "Mayfield -- Clovenstone", "buses": [
                                    { "destination": "CLOVENSTONE", "arrivalTime": "5", "accessible": true },
                                    { "destination": "CLOVENSTONE", "arrivalTime": "*30", "accessible": false }
                            ]
                    },
                    { "serviceName": "25", "route": "Riccarton -- Restalrig", "buses": [
                                    { "destination": "RICCARTON", "arrivalTime": "*12", "accessible": false },
                                    { "destination": "RICCARTON", "arrivalTime": "42", "accessible": true }
                            ]
                    },
                    { "serviceName": "33", "route": "Westburn -- Ferniehill", "buses": [
                                    { "destination": "BABERTON", "arrivalTime": "22", "accessible": true },
                                    { "destination": "LONGSTONE", "arrivalTime": "45", "accessible": true }
                            ]
                    }
            ]
    };

    res.writeHead(200, {'content-type':'text/json'});
    res.end(JSON.stringify(buses));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

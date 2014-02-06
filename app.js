/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var request = require('request');
var crypto = require('crypto');
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
var busStop_Potterow = '36253583';
var busStop_GiffordsPark = '36238273';
var busStop_KingsBuildings = '36245896';
/*var urlKingsToCentral = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36253583&busStopCode=36245896';
var urlPotterowToKings = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36253583';
var urlGiffordToKings = 'http://www.mybustracker.co.uk/?module=mobile&busStopDest=36245896&busStopCode=36238273';*/

/**
  * Routes
  */
app.get('/', function(req, res) { 
    res.writeHead(200,{'content-type':'text/json'});
    res.end(JSON.stringify("More information on GitHub [https://github.com/iamwolf/edinburghbustracker-parser] - please use correct routes")); 
});

app.get('/test', function(req, res) {
	buses = [{number: 'Uni-Shuttle', arrivalTime: 'DUE'}, {number: '41', arrivalTime: '5'}, {number: 'Uni-Shuttle', arrivalTime: '30'}, {number: '41', arrivalTime: '35'}];
	res.send(JSON.stringify(buses));
});

app.get('/:from', function(req, res) {
    var busstop = (req.param('from')=='kb') ? busStop_KingsBuildings : (req.param('from')=='meadows') ? busStop_GiffordsPark : busStop_Potterow;

    var d = new Date();
    var dateString = d.getFullYear().toString() + ('0' + (d.getMonth()+1)).slice(-2) + ('0' + d.getDate()).slice(-2) + ('0' + d.getHours()).slice(-2);
    var requestAPIKey = crypto.createHash('md5').update(process.env.APIKEY + dateString).digest('hex');
    var apiURI = 'http://ws.mybustracker.co.uk/?module=json&key=' + requestAPIKey + '&function=getBusTimes&stopId=' + busstop;

    request(apiURI, function (error, response, t) {
        if (!error && response.statusCode == 200) {
            var buses = [];
            t = JSON.parse(t);

            for (i in t.busTimes) {
                if(['55','126',''].join(',').indexOf(t.busTimes[i].refService+',')>-1) {
                    for (j in t.busTimes[i].timeDatas) {
                        var bus = {};
                        bus.number = t.busTimes[i].mnemoService;
                        bus.number = (bus.number=='C134') ? 'Uni-Shuttle' : bus.number;
                        bus.arrivalTime=t.busTimes[i].timeDatas[j].minutes;
                        buses.push(bus);
                    }
                }

                if (i==(t.busTimes.length-1)) {
                    buses.sort(function(a,b) {
                        return (a.arrivalTime>b.arrivalTime);
                    });

                    res.send(JSON.stringify(buses));
                }
            }
        }
    });
});

/*app.get('/parsed-data/:from', function(req, res) {
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

            if (window.$('table.timesTable tbody tr:visible:not(.tHeader):not(.tResult):not(.tFooter) td.time a').length>0) {
                for (var i=0; i<window.$('table.timesTable tbody tr:visible:not(.tHeader):not(.tResult):not(.tFooter) td.time a').length; i++) {
                    var busNumber = window.$(window.$('table.timesTable tbody tr:visible:not(.tHeader):not(.tResult):not(.tFooter)')[i]).children().first().text();
                    busNumber = (busNumber=='C134') ? 'Uni-Shuttle' : busNumber;
                    var busDestination = window.$(window.$('tr:visible:not(.tHeader):not(.tResult):not(.tFooter) td.dest')[i]).text();
                    var busArrivalTime = window.$(window.$('tr:visible:not(.tHeader):not(.tResult):not(.tFooter) td.time a')[i]).text();
                    console.log("Bus No. ", busNumber, "to", busDestination, "departs in", busArrivalTime);

                    var bus = {number: busNumber, arrivalTime: busArrivalTime};
                    buses.push(bus);

                    if (i==(window.$('table.timesTable tbody tr:visible:not(.tHeader):not(.tResult):not(.tFooter) td.time a').length-1)) {
                        buses.sort(function(a,b) {
                            return (parseInt(a.arrivalTime)>parseInt(b.arrivalTime));
                        });
                        res.end(JSON.stringify(buses));
                    }
                }
            } else {
                res.end(JSON.stringify(buses));
            }
          	window.close(); // save/free memory
          }
        );
    } else {
        res.end('Sorry, we do not support this bus stop');
    }    
});*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

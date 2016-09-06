/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var request = require('request');
var crypto = require('crypto');
var time = require('time')(Date);

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
    console.log("Running in development environment");
    app.use(express.errorHandler());
}

/**
  * Configuration variables: bus stop codes & URLs
  */
var busStop_Potterow = '36253583';
var busStop_GiffordsPark = '36238273';
var busStop_KingsBuildings = '36245896';

/**
  * Routes
  */
app.get('/', function(req, res) { 
    res.redirect('http://kbshuttlebus.rentawolf.com');
});

app.get('/test', function(req, res) {
	buses = [{number: 'Uni-Shuttle', arrivalTime: 'DUE'}, {number: '41', arrivalTime: '5'}, {number: 'Uni-Shuttle', arrivalTime: '30'}, {number: '41', arrivalTime: '35'}];
	res.json(buses);
});

app.get('/:from', function(req, res) {
    var busstop = (req.param('from')=='kb') ? busStop_KingsBuildings : (req.param('from')=='meadows') ? busStop_GiffordsPark : busStop_Potterow;

    var d = new Date();
    d.setTimezone('Europe/London');
    var dateString = d.getFullYear().toString() + ('0' + (d.getMonth()+1)).slice(-2) + ('0' + d.getDate()).slice(-2) + ('0' + d.getHours()).slice(-2);
    var requestAPIKey = crypto.createHash('md5').update(process.env.APIKEY + dateString).digest('hex');
    var apiURI = 'http://ws.mybustracker.co.uk/?module=json&key=' + requestAPIKey + '&function=getBusTimes&stopId=' + busstop;

    request(apiURI, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var buses = [];
            var t = JSON.parse(body);

            if (t.busTimes.length > 0) {
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
            } else {
                res.send(JSON.stringify(buses));
            }
        } else {
            console.error("Error", error);
            res.writeHead(500);
            res.send(JSON.stringify(error));
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

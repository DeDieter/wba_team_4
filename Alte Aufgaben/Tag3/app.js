var http = require('http');
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var app = express();
var faye = require('faye');
var server = http.createServer(app);
var mongoDB = require('mongoskin');

var bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

bayeux.attach(server);
var pubClient = bayeux.getClient();

app.configure(function () {

    app.use(express.static( __dirname + '/public'));
    app.use(express.json());
    app.use(express.urlencoded());
    
});

var db = mongoDB.db('mongodb://localhost/planeten?auto_reconnect=true', {
    safe: true
});

db.bind("planeten");
var daba = db.planeten;

/*

//Datenbank mit Inhalt füllen
daba.insert([
              {name: "Merkur", abstand: "58000000", durchmesser: "4840"},
              {name: "Venus", abstand: "108000000", durchmesser: "12400"},
              {name: "Erde", abstand: "150000000", durchmesser: "12742"},
              {name: "Mars", abstand: "280000000", durchmesser: "6800"},
              {name: "Jupiter", abstand: "775000000", durchmesser: "142800"},
              {name: "Saturn", abstand: "1440000000", durchmesser: "120800"},
              {name: "Uranus", abstand: "2870000000", durchmesser: "47600"},
              {name: "Neptun", abstand: "4500000000", durchmesser: "44600"},
              {name: "Pluto", abstand: "5900000000", durchmesser: "5800"}
              ], function(err, planeten){
                    console.log("DB-Fehler!");
              });

*/

app.get('/get', function (req, res, next){
    
    daba.findItems(function(err, result) {
        if(err)
            next(err);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(result));
        } 
    });
});

app.post('/planeten', function (req, res){
    
    daba.insert(req.body, function(error, planeten) {
		if(error) next(error);
		else console.log(req.body.name + ' gespeichert!');
	});
    
	var publication = pubClient.publish('/planeten', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.name + ' veröffentlicht auf "/planeten"!');
		res.end();
	}, function(error) {
		next(error);
	});
});

app.listen(3000);

var express = require('express');
var http = require('http');
var faye = require('faye');
var mongo = require('mongoskin');



var db = mongo.db('mongodb://localhost/week3?auto_reconnect=true', {safe: true});

db.bind('planeten');

var planeten = db.planeten;
var app = express();
var server = http.createServer(app);
var bayeux = new faye.NodeAdapter({
	mount: '/faye',
	timeout: 45
});

bayeux.attach(server);
var pubClient = bayeux.getClient();


app.use(express.static((__dirname + '/public')));
app.use(express.json());
app.use(express.urlencoded());
app.use(function(error, req, res, next) {
	console.error(error.stack);
	res.end(error.message);
});


app.set('port', 3000);


app.get('/planeten', function(req, res, next) {

	planeten.findItems(function(error, result) {
		if(error) next(error);
		else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
		};
	});
});


app.post('/planeten', function(req, res, next) {
	planeten.insert(req.body, function(error, planeten) {
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

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
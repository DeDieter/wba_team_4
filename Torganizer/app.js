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

var db = mongoDB.db('mongodb://localhost/Torganizer?auto_reconnect=true', {
    safe: true
});


app.get('/tget', function (req, res, next){
    
    
    db.bind("team");
    var daba = db.team;
    
    
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

app.get('/tabelleget', function (req, res, next){
    
    
    db.bind("team");
    var daba = db.team;
    
    
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

app.get('/sget', function (req, res, next){
    
    
    db.bind("spieler");
    var daba = db.spieler;
    
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

app.post('/team', function (req, res){
    
    
    db.bind("team");
    var daba = db.team;
    
    daba.insert(req.body, function(error, team) {
		if(error) next(error);
		else console.log(req.body.name + ' gespeichert!');
	});
    
	var publication = pubClient.publish('/team', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.name + ' veröffentlicht auf "/team"!');
		res.end();
	}, function(error) {
		next(error);
	});
});
app.post('/ergebnis', function (req, res){
    
    
    db.bind("ergebnis");
    var daba = db.ergebnis;
    
    daba.insert(req.body, function(error, ergebnis) {
		if(error) next(error);
		else console.log(req.body.sname + ' gespeichert!');
	});
    
	var publication = pubClient.publish('/ergebnis', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.sname + ' veröffentlicht auf "/ergebnis"!');
		res.end();
	}, function(error) {
		next(error);
	});
});

app.get('/liveget', function (req, res, next){
    
    
    db.bind("ergebnis");
    var daba = db.ergebnis;
    
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
app.post('/spieler', function (req, res){
    
    
    db.bind("spieler");
    var daba = db.spieler;
    
    daba.insert(req.body, function(error, spieler) {
		if(error) next(error);
		else console.log(req.body.sname + ' gespeichert!');
	});
    
	var publication = pubClient.publish('/spieler', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.sname + ' veröffentlicht auf "/spieler"!');
		res.end();
	}, function(error) {
		next(error);
	});
});

app.get('/eteamg', function (req, res, next){
    
    
    db.bind("spieler");
    var daba = db.spieler;
    
    
    daba.find({tname:su}).toArray(function(err, result) {
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
var su;
app.post('/eteamp', function (req, res){
    
    
    su = req.body.name;
});



server.listen(3000);

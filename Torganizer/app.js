var http = require('http');
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var app = express();
var faye = require('faye');
var server = http.createServer(app);
var mongoDB = require('mongoskin'),
fs = require('fs');

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

//
//var doesNotModifyBody = function(request, response, next) {
//  request.params = {
//    a: "b"
//  };
//  // calls next because it hasn't modified the header
//  next();
//};
//
//// middleware that modify the response body
//var doesModifyBody = function(request, response, next) {
//  response.setHeader("Content-Type", "text/html");
//  response.write("<p>Hello World</p>");
//  response.end();
//  // doesn't call next()
//};
//
//app.use(doesNotModifyBody);
//app.use(doesModifyBody);


app.get('/tget', function (req, res, next){
    
    
    db.bind("team");
    var daba = db.team;
    
    //mongoskin sort
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
    
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
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

app.post('/spieler', function (req, res, next){
    
    
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


app.post('/spunkte', function (req, res){
    db.bind("spieler");
    var daba = db.spieler;
    
    
    daba.find({sname:req.body.name}).toArray(function(err, result) {
    if(err)
            next(err);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            
            res.end(JSON.stringify(result));
            var p = parseInt(req.body.punkte, 10) + parseInt(result[0].punkte, 10);
             daba.update({sname:req.body.name}, {$set:{punkte:p}}, function(err, result) {
                if (!err) console.log('Punkte hinzugefuegt!');
                });
    
                var publication = pubClient.publish('/punkte', req.body);

                publication.then(function() {
                    res.writeHead(200, 'OK');
                    console.log(req.body.name + ' veröffentlicht auf "/punkte"!');
                    res.end();
                }, function(error) {
                    next(error);
                });
            //Update hier rein!!!!!
            
        } 
    });
    
    
    /*
    daba.update({sname:req.body.name}, {$set:{punkte:req.body.punkte}}, function(err, result) {
    if (!err) console.log('Punkte hinzugefuegt!');
    });
    
	var publication = pubClient.publish('/punkte', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.name + ' veröffentlicht auf "/punkte"!');
		res.end();
	}, function(error) {
		next(error);
	});*/
    
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

app.post('/spielStart', function (req, res, next){
    
    
    
    db.bind("spiel");
    var daba = db.spiel;
    
    daba.insert(req.body, function(error, spiel) {
		if(error) next(error);
		else console.log(req.body.ereignis + ' - gespeichert!');
	}); 
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
    var ticker = 'Spielbeginn: ' + req.body.teamA + ' gegen ' + req.body.teamB + '!';
    
    daba.insert({tick: ticker}, function(error, liveticker) {
		if(error) next(error);
		else console.log(ticker + ' - gespeichert!');
	});
    
	var publication = pubClient.publish('/liveticker', ticker);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(ticker + ' - veröffentlicht auf "/liveticker"!');
		res.end();
	}, function(error) {
		next(error);
	});
    
});

var su;
app.post('/eteamp', function (req, res){
    
    
    su = req.body.name;
});



server.listen(3000);

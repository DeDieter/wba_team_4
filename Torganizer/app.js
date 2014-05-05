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

app.post('/livepost', function (req, res){
    
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
    daba.insert(req.body, function(error, liveticker) {
		if(error) next(error);
		else console.log(req.body.tick + ' gespeichert!');
	});
    
	var publication = pubClient.publish('/liveticker', req.body.tick);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.tick + ' veröffentlicht auf "/liveticker"!');
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
		else console.log(req.body.name + ' gespeichert!');
	});
    
    
	var publication = pubClient.publish('/spieler', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(req.body.name + ' veröffentlicht auf "/spieler"!');
        res.end();
	}, function(error) {
		next(error);
	});
});

var teamA = 0;
var teamB = 0;

app.post('/spunkte', function (req, res){
    
    db.bind("spieler");
    var daba = db.spieler;
    
    var tick;
    
    daba.find({name:req.body.name}).toArray(function(err, result) {
    if(err)
            next(err);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            
            res.end(JSON.stringify(result));
            var p = parseInt(req.body.punkte, 10) + parseInt(result[0].punkte, 10);
             daba.update({name:req.body.name}, {$set:{punkte:p}}, function(err, result) {
                if (!err){
                    console.log('Punkte hinzugefuegt!');
                    db.bind("liveticker");
                    var daba = db.liveticker;
                    
                    var ticker = '' + req.body.name + ' hat ' + req.body.punkte + ' Punkte gemacht';

                    daba.insert({tick: ticker}, function(error, liveticker)
                    {
                        if(error) next(error);
                        else{
                            
                            var publication = pubClient.publish('/liveticker', ticker);

                            publication.then(function() {
                                res.writeHead(200, 'OK');
                                console.log(ticker + ' - veröffentlicht auf "/liveticker"!');
                                res.end();
                            }, function(error) {
                                next(error);
                            });
                            
                            console.log(ticker + ' - in liveticker hinzugefuegt');
                            
                            //Punkte beim Spieler hinzufuegen
                            db.bind("spieler");
                            var daba = db.spieler;
                            //Tea
                            daba.find({name:req.body.name}).toArray(function(err, result) {
                                var team = result[0].team;

                                db.bind("spiel");
                                var daba = db.spiel;
                                    
                                    if(req.body.teamA == team)
                                    {
                                        teamA = teamA + parseInt(req.body.punkte, 10);
                                        daba.update({teamA:req.body.teamA, teamB:req.body.teamB }, {$set:{aPunkte:teamA}}, function(err, result)
                                        {
                                            if(error) next(error);
                                        });
                                    }
                                    else
                                    {
                                        teamB = teamB + parseInt(req.body.punkte, 10);
                                        daba.update({teamA:req.body.teamA, teamB:req.body.teamB }, {$set:{bPunkte:teamB}}, function(err, result)
                                        {
                                            if(error) next(error);
                                        });
                                    }
                             
                                    
                                //publish Zwischenstand des Spiels
                                ticker = req.body.teamA + '  -  '  + teamA + ' : ' + teamB + '  -  ' + req.body.teamB;
                                       
                                    var publication = pubClient.publish('/liveticker', ticker);

                                    publication.then(function() {
                                        res.writeHead(200, 'OK');
                                        console.log(ticker + ' - veröffentlicht auf "/liveticker"!');
                                        res.end();
                                    }, function(error) {
                                        next(error);
                                    });
                                
                            });
                        }
                    });

                    
                }
            });
    
            
            
            //Update hier rein!!!!!
            
        } 
    });
    
    
    /*  SET!
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
		else console.log('Neues Spiel - gespeichert!');
	}); 
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
    var ticker = 'Spielbeginn: ' + req.body.teamA + ' gegen ' + req.body.teamB + '!';
    
    daba.insert({tick: ticker}, function(error, liveticker) {
		if(error) next(error);
	});
    
	var publication = pubClient.publish('/liveticker', ticker);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		res.end();
	}, function(error) {
		next(error);
	});
    
});

app.post('/spielEnde', function (req, res, next){
    
    
    console.log(teamA + ' !! ' + teamB);
    
    if(teamA>teamB){
        
       teamPunkteAdd(req.body.teamA, 3);  
    }
    
    else if(teamA==teamB)
    {
        teamPunkteAdd(req.body.teamA, 1);
        teamPunkteAdd(req.body.teamB, 1); 
    }
    
    else{
        teamPunkteAdd(req.body.teamB, 3); 
    }
    
    var ticker = ' Spielende!';
    
    var publication = pubClient.publish('/liveticker', ticker);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		console.log(ticker + ' - veröffentlicht auf "/liveticker"!');
		res.end();
	}, function(error) {
		next(error);
	});
    
    teamA = 0;
    teamB = 0;
    
});
    
function teamPunkteAdd(team, punkte)    
    {
            
    db.bind("team");
    var daba = db.team; 
        
    daba.find({name:team}).toArray(function(err, result) {
            if(err)
            next(err);
        else {
            
            punkte = punkte + parseInt(result[0].punkte, 10);
            
        }
        
    daba.update({name:team}, {$set:{punkte:punkte}}, function(err, result) {
                if (!err){ }
		else console.log('Spiel beendet - gespeichert!');
               
        });
        
        
    });
    }
                                                                
    
    
//        |
//    
//    
//	}); 
//        
//        
//    }
//    
//    daba.insert(req.body, function(error, spiel) {
//		if(error) next(error);
//		else console.log('Spiel beendet - gespeichert!');
//	}); 
//    
//    db.bind("liveticker");
//    var daba = db.liveticker;
//    
//    var ticker = 'Das Spiel ist vorbei! Sieg für ';
//    
//    daba.insert({tick: ticker}, function(error, liveticker) {
//		if(error) next(error);
//		else console.log(ticker + ' - gespeichert!');
//	});
//    
//	var publication = pubClient.publish('/liveticker', ticker);
//	
//	publication.then(function() {
//		res.writeHead(200, 'OK');
//		console.log(ticker + ' - veröffentlicht auf "/liveticker"!');
//		res.end();
//	}, function(error) {
//		next(error);
//	});
//    
    

var su;
app.post('/eteamp', function (req, res){
    
    
    su = req.body.name;
});



server.listen(3000);

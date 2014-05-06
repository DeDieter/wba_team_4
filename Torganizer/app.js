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
    
    daba.findItems(function(error, result) {
        if(error)
            next(error);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(result));
        } 
    });
});

app.get('/spiel', function (req, res, next){
    
    
    db.bind("spiel");
    var daba = db.spiel;
    
    daba.findItems(function(error, result) {
        if(error)
            next(error);
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
    
    
    daba.findItems(function(error, result) {
        if(error)
            next(error);
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
    
    daba.findItems(function(error, result) {
        if(error)
            next(error);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(result));
        } 
    });
});

app.post('/team', function (req, res, next){
    
    
    db.bind("team");
    var daba = db.team;
    
    daba.insert(req.body, function(error, team) {
		if(error) next(error);
	});
    
	var publication = pubClient.publish('/team', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		res.end();
	}, function(error) {
		next(error);
	});
});

app.post('/spieler', function (req, res, next){
    
    db.bind("spieler");
    var daba = db.spieler;

    daba.insert(req.body, function(error, spieler) {
		if(error) next(error);
	});
    
    
	var publication = pubClient.publish('/spieler', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
        res.end();
	}, function(error) {
		next(error);
	});
});

app.post('/livepost', function (req, res, next){
    
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
    daba.insert(req.body.tick, function(error, liveticker) {
		if(error) next(error);
	});
    
	livetick(req.body.tick, res, next);
    
});

app.get('/liveget', function (req, res, next){
    
    
    db.bind("liveticker");
    var daba = db.liveticker;
    
    daba.findItems(function(error, result) {
        if(error)
            next(error);
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(result));
        } 
    });
});

var teamA;
var teamB;

app.post('/spunkte', function (req, res, next){
    
    db.bind("spieler");
    var daba = db.spieler;
    
    daba.find({name:req.body.name}).toArray(function(error, result) {
    if(error)
            next(error);
        else {
            
            var p = parseInt(req.body.punkte, 10) + parseInt(result[0].punkte, 10);
            
                        var team = result[0].team;
            daba.update({name:req.body.name}, {$set:{punkte:p}}, function(error, result)
            {
                if(error) next(error);
                else
                {
                    livetick('' + req.body.name + ' hat ' + req.body.punkte + ' Punkte gemacht', res, next);
                    db.bind("spiel");
                        var daba = db.spiel;

                        if(req.body.teamA == team)
                        {
                            teamA = teamA + parseInt(req.body.punkte, 10);
                            daba.update({teamA:req.body.teamA, teamB:req.body.teamB }, {$set:{aPunkte:teamA}}, function(error, result)
                            {
                                if(error) next(error);
                            });
                        }
                        else
                        {
                            teamB = teamB + parseInt(req.body.punkte, 10);
                            daba.update({teamA:req.body.teamA, teamB:req.body.teamB }, {$set:{bPunkte:teamB}}, function(error, result)
                            {
                                if(error) next(error);
                            });
                        }
                    
                        /* Publish Zwischenstand des Spiels */
                        livetick(req.body.teamA + '  -  '  + teamA + ' : ' + teamB + '  -  ' + req.body.teamB, res, next);

                    }
                });
            
            
             

            }
        }); 
    });   

app.post('/spielStart', function (req, res, next){
    
    teamA = 0;
    teamB = 0;
    db.bind("spiel");
    var daba = db.spiel;
    
    daba.insert(req.body, function(error, spiel) {
		if(error) next(error);
	});    
    
    livetick('Spielbeginn - ' + req.body.teamA + ' vs. ' + req.body.teamB + '!', res, next);
    
    var publication = pubClient.publish('/spiel', req.body);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		res.end();
	}, function(error) {
		next(error);
	});
    
});

app.post('/spielEnde', function (req, res, next){
    
    var gewinner;
    
    if(teamA>teamB){
        
       
        gewinner = req.body.teamA;
        teamPunkteAdd(req.body.teamA, 3, next);  
    }
    
    else if(teamA==teamB)
    {
        
        gewinner = 'Niemand';
        teamPunkteAdd(req.body.teamA, 1, next);
        teamPunkteAdd(req.body.teamB, 1, next); 
    }
    
    else{
        gewinner = req.body.teamB;
        teamPunkteAdd(req.body.teamB, 3, next); 
    }

    livetick('Spielende - ' + gewinner + ' gewinnt!', res, next);
    
});
    
function teamPunkteAdd(team, punkte, next)    
{
    db.bind("team");
    var daba = db.team; 

    daba.find({name:team}).toArray(function(error, result) {
        if(error) next(error);
        else punkte = punkte + parseInt(result[0].punkte, 10);

        daba.update({name:team}, {$set:{punkte:punkte}}, function(error, result) {
            if(error) next(error);
            else console.log('Spiel beendet - gespeichert!');

        });
    });
}

function livetick(tick, res, next)
{
    db.bind("liveticker");
    var daba = db.liveticker;

    daba.insert({tick:tick}, function(error, liveticker) {
        if(error) next(error);
    });
    
    var publication = pubClient.publish('/liveticker', tick);
	
	publication.then(function() {
		res.writeHead(200, 'OK');
		res.end();
	}, function(error) {
		next(error);
	});
}
    
server.listen(3000);

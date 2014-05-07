var http = require('http');
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var app = express();
var faye = require('faye');
var server = http.createServer(app);
var mongoDB = require('mongoskin');
var teamA;
var teamB;

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

app.get('/spiel', function (req, res, next)
{
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

app.get('/teamliste', function (req, res, next)
{
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

app.get('/spielerliste', function (req, res, next)
{
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

app.post('/teamliste', function (req, res, next)
{
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
    
    console.log(req.body.name + ' nimmt am Turnier teil');
    
});

app.post('/spielerliste', function (req, res, next)
{
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
    
    console.log(req.body.name + ' hat sich dem Team "' + req.body.team + '" angeschlossen');
    
});

app.post('/liveticker', function (req, res, next)
{
	livetick(req.body.tick, res, next);
    
});

app.post('/punkte', function (req, res, next)
{
    /* Die id (req.body.id) wird in eine ObjectId umgewandelt*/
    var ObjectId = require('mongoskin').ObjectID;
    var id = new ObjectId(req.body.id);
    
    db.bind("spieler");
    var daba = db.spieler;
    
    /* Vom gefundenen Spieler ... */
    daba.find({_id: id }).toArray(function(error, result) {
        
    if(error)
            next(error);
        else
        {
            /* ... werden Name und Team zwischengespeichert */
            var spieler = result[0].name;
            var team = result[0].team;
            /* Die alten Punkte (result[0].punkte) werden in einen Integer umgewandelt
            und auf die neuen gemachten Punkte (req.body.punkte) addiert */
            var p = parseInt(req.body.punkte, 10) + parseInt(result[0].punkte, 10);
            
            /* Die neuen Punkte des Spielers werden in der Tabelle "spieler" aktualisiert */
            daba.update({_id:id}, {$set:{punkte:p}}, function(error, result)
            {
                if(error) next(error);
                else
                {
                    /* Publish den Spieler und Punkte-Anzahl */
                    livetick('' + spieler + ' hat ' + req.body.punkte + ' Punkte gemacht', res, next);
                    
                    /* Das Team des Spielers bekommt die Punkte ebenfalls gutgeschrieben */
                    if(req.body.teamA == team)
                        teamA = teamA + parseInt(req.body.punkte, 10);
                    else
                        teamB = teamB + parseInt(req.body.punkte, 10);
                    
                    /* Publish Zwischenstand des Spiels */
                    livetick(req.body.teamA + '  -  '  + teamA + ' : ' + teamB + '  -  ' + req.body.teamB, res, next);
                    
                }
            });
         }
    });
});   

app.post('/spielStart', function (req, res, next)
{
    teamA = 0;
    teamB = 0;
    
    db.bind("spiel");
    var daba = db.spiel;
    
    daba.insert(req.body, function(error, spiel) {
		if(error) next(error);
	});    
    
    livetick('Spielbeginn - ' + req.body.teamA + ' vs. ' + req.body.teamB + '!', res, next);
    
});

app.post('/spielEnde', function (req, res, next)
{
    var gewinner;
    /* Der Gewinner wird ermittelt */
    if(teamA>teamB)
    {
        gewinner = req.body.teamA;
        /* 3 Punkte bei Sieg */
        teamPunkteAdd(req.body.teamA, 3, next);  
    }
    
    else if(teamA==teamB)
    {
        gewinner = 'Niemand';
        /* 1 Punkt bei Unentschieden */
        teamPunkteAdd(req.body.teamA, 1, next);
        teamPunkteAdd(req.body.teamB, 1, next); 
    }
    
    else{
        gewinner = req.body.teamB;
        teamPunkteAdd(req.body.teamB, 3, next); 
    }

    db.bind("spiel");
    var daba = db.spiel;
    
    /* Tabelle "spiel" mit den neuen Punkten der Teams dieser Begegnung aktualisieren */
    daba.update({teamA:req.body.teamA, teamB:req.body.teamB }, {$set:{aPunkte: teamA, bPunkte:teamB}}, function(error, result)
    {
        if(error) next(error);
    });
    
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
        });
    });
}

function livetick(tick, res, next)
{
    var publication = pubClient.publish('/liveticker', tick);
    
    publication.then(function() {
        res.writeHead(200, 'OK');
        res.end();
	}, function(error) {
        next(error);
    });
}
    
server.listen(3000);

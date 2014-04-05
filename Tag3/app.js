var http = require('http');
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var app = express();


app.configure(function () {

    app.use(express.static( __dirname + '/public'));
    app.use(express.json());
    app.use(express.urlencoded());
    
});

//Datenbankverbindung
var mongoDB = require('mongoskin');



var db = mongoDB.db('mongodb://localhost/planeten?auto_reconnect=true', {
    safe: true
});
//db.dropDatabase();
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

function anzeige(req, res)
{
    

console.log('HTTP-Request gestartet')
          console.log('HTTP-Methode: '+req.method);
          
 
    daba.findItems(function(err, planeten){
        
        if(err)
        {
            console.log("Fehler!");
        }
            else {
                 res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                 res.write("<html><table border = '1'><tr><td>Name</td><td>Abstand</td><td>Durchmesser</td></tr>");
                 res.write("<tr></tr>");
                planeten.forEach(function(planet){
                
                    res.write("<tr><td>"+ planet.name +"</td>");
                                res.write("<td>"+ planet.abstand +"</td>");
                                res.write("<td>"+ planet.durchmesser +"</td></tr>");
                                });
                 res.write("</table>");
                 res.end(JSON.stringify(planeten));
                
                     
        }
    });
    
}

app.get('/get', function (req, res, next){
    
    //anzeige(req,res);
    
          //console.log('aha1');
    /*res.send("JO");
          console.log('aha1');
    
    
      */
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
    console.log(req.body.name + " wurde hinzugefuegt!");
	//planet.push(req.body);
    
    daba.insert(
        {name: req.body.name,
         abstand: req.body.abstand,
         durchmesser: req.body.durchmesser
        }, function(err, planeten){
                    console.log("DB-Fehler!");
              });

    anzeige(req,res);
               
});

app.listen(3000);
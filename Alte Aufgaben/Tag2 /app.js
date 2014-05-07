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

        var planet = [
              {name: "Merkur", abstand: "58000000", durchmesser: "4840"},
              {name: "Venus", abstand: "108000000", durchmesser: "12400"},
              {name: "Erde", abstand: "150000000", durchmesser: "12742"},
              {name: "Mars", abstand: "280000000", durchmesser: "6800"},
              {name: "Jupiter", abstand: "775000000", durchmesser: "142800"},
              {name: "Saturn", abstand: "1440000000", durchmesser: "120800"},
              {name: "Uranus", abstand: "2870000000", durchmesser: "47600"},
              {name: "Neptun", abstand: "4500000000", durchmesser: "44600"},
              {name: "Pluto", abstand: "5900000000", durchmesser: "5800"}
              ];
        

function anzeige(req, res)
{
    
console.log('HTTP-Request gestartet')
          console.log('HTTP-Methode: '+req.method);
          
 
                 res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                 res.write("<html><table border = '1'><tr><td>Name</td><td>Abstand</td><td>Durchmesser</td></tr>");
                 res.write("<tr></tr>");
                 
                 planet.forEach(function(planet)
                                {
                                res.write("<tr><td>"+ planet.name +"</td>");
                                res.write("<td>"+ planet.abstand +"</td>");
                                res.write("<td>"+ planet.durchmesser +"</td></tr>");
                                });
                 res.write("</table>");
                 res.end();
    
}

app.get('/planeten', function (req, res){

    anzeige(req,res);
    
});

app.post('/planeten', function (req, res){
    console.log(req.body.name + " wurde hinzugefuegt!");
	planet.push(req.body);
    anzeige(req,res);
               
});

app.listen(3000);

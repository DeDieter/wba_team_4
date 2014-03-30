var http = require('http');
var express = require('express');

var planeten = [
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

var app = express();

app.use(express.static((__dirname + '/public')));

app.use(express.json());

app.use(express.urlencoded());


app.set('port', 3000);

app.get('/planeten', function(req, res) {
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("<html><table border = '1'><tr><td>Name</td><td>Abstand</td><td>Durchmesser</td></tr>");
    res.write("<tr><td></td><td></td><td></td></tr>");
                 
                 planeten.forEach(function(planeten)
                                {
                                res.write("<tr><td>"+ planeten.name +"</td>");
                                res.write("<td>"+ planeten.abstand +"</td>");
                                res.write("<td>"+ planeten.durchmesser +"</td></tr>");
                                });
                 res.write("</table>");
    res.end();
});

app.post('/planeten', function(req, res) {
    
    console.log(req.body);
    
    planeten.push(req.body);
    
    res.writeHead(200);
    
    res.end();
});

app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
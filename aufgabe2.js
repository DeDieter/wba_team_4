var http = require('http');
var server = http.createServer();
var	url	=	require('url');	


var planeten =  [
                 {name: "Merkur", abstand: "58000000", durchmesser: "4840"},
                 {name: "Venus", abstand: "108000000", durchmesser: "12400"},
                 {name: "Erde", abstand: "150000000", durchmesser: "12742"},
                 {name: "Mars", abstand: "280000000", durchmesser: "6800"},
                 {name: "Jupiter", abstand: "775000000", durchmesser: "142800"},
                 {name: "Saturn", abstand: "1440000000", durchmesser: "120800"},
                 {name: "Uranus", abstand: "2870000000", durchmesser: "47600"},
                 {name: "Neptun", abstand: "4500000000", durchmesser: "44600"},
                 {name: "Pluto", abstand: "5900000000", durchmesser: "5800"},
                 ];

server.on('request', function(req, res)
{
          console.log('HTTP-Request gestartet')
          console.log('HTTP-Methode: '+req.method);
    
          var pfad=url.parse(req.url).pathname;	
        
            if(pfad=="/planeten"){
    
          res.writeHead(200, "OK", {'Content-Type': 'text/html'});
          res.write("<html><table><tr><td> | Name</td><td> | Abstand</td><td> | Durchmesser</td></tr>");
          res.write("<tr><td>------------</td><td>----------------</td><td>-------------</td></tr>");
          
          planeten.forEach(function(planet)
          {
                  res.write("<tr><td> | "+  planet.name         +"</td>");
                  res.write("<td> | "+      planet.abstand      +"</td>");
                  res.write("<td> | "+      planet.durchmesser  +"</td></tr>");
          });
          
          res.write("</table></html>");
            }else{
            res.write('Planeten gibts unter /planeten');
        
            }
          res.end();
          
});

server.listen(8888);
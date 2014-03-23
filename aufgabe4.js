var http = require('http');
var server = http.createServer();
var querystring = require('querystring');
var	url	=	require('url');	

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

server.on('request',function(req, res)
{
          console.log('HTTP-Request gestartet')
          console.log('HTTP-Methode: '+req.method);
          
          var body = '';
    
          req.on('data', function(data){
          body = body + data.toString();
          var daten = querystring.parse(body);   
          planet.push(daten);
          });    
    
          req.on('end', function(){
              
          var pfad = url.parse(req.url).pathname;	
              
          if(pfad=="/planeten"){
    
          res.writeHead(200, "OK", {'Content-Type': 'text/html'});
          res.write("<html><table><tr><td> | Name</td><td> | Abstand</td><td> | Durchmesser</td></tr>");
          res.write("<tr><td>------------</td><td>----------------</td><td>-------------</td></tr>");
          
          planet.forEach(function(planet)
          {
                  res.write("<tr><td> | "+ planet.name +"</td>");
                  res.write("<td> | "+ planet.abstand +"</td>");
                  res.write("<td> | "+ planet.durchmesser +"</td></tr>");
          });
          res.write("</table>");
    
          res.write("<form action='http://localhost:8888/planeten' method='POST'>");
          res.write("<label>Planet</label><input type='text' name='name' value=''/></br>");
          res.write("<label>Abstand zur Sonne</label><input type='text' name='abstand' value=''/></br>");
          res.write("<label>Durchmesser</label><input type='text' name='durchmesser' value=''/></br>");
          res.write("<input type='submit' value='Senden' />");
          res.write("</form>");
          
          res.write("</html>");      
          } 
          else{
            res.write('Planeten gibts unter /planeten');
            }
          res.end();
          }); 
});

server.listen(8888);
// I am server-sample.js
var net = require('net');

var dataFloat;
var reponse;

var server = net.createServer(function(c) {
    console.log('client connected');

    c.on('data',function(data) {
        console.log("Received data is: " + data);
        dataFloat = parseFloat(data);
        console.log(dataFloat);
        if (dataFloat <= 5) {
            reponse = "ON"
        } else if(dataFloat > 5) {
            reponse = "OFF"
        } else {
            reponse = "Hello form BBB Server!";
        }
         
        // Do something more
        c.write(reponse);
    });

    c.on('end', function() {
        console.log('client disconnected');
    });
});


server.listen(8124, function() {
  console.log('Server is launched.');
});
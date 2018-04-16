// This code is from the following example:
// https://stackoverflow.com/questions/40597586/connecting-2-beaglebone-black-devices-over-ethernet-network

// I am server.js
var net = require('net');

var server = net.createServer(function(c) {
    console.log('client connected');

    c.on('data',function(data) {
        console.log("Received data is: " + data);
        var reponse = "Hello form BBB Server!";
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

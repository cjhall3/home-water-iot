// THIS IS FROM A SAMPLE TEST PROGRAM FROM:
// https://stackoverflow.com/questions/40597586/connecting-2-beaglebone-black-devices-over-ethernet-network

// I am client.js
var net = require('net');

var server_ip = '192.168.7.2';      // here enter your BBB-server IP address
var client = net.connect(8124, server_ip, function() {
  console.log('connected to server!');
  client.write('Hello from BBB client');
});

client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});

client.on('end', function() {
  console.log('disconnected from server');
});

// I am client-sample.js
var net = require('net');
var alive = true;
var x = 0;
var outString; "";

var myVar;

var server_ip = '192.168.7.2';      // here enter your BBB-server IP address
var client = net.connect(8124, server_ip, function() {
  console.log('connected to server!');
  client.write('Hello from BBB client');
  
  myVar = setInterval(checkalive,1000);
  
});

client.on('data', function(data) {
  console.log(data.toString());
  if(alive == false) {
    console.log("END");
    client.end();
    clearInterval(myVar);
  }
});

client.on('input',function(input) {
  client.write('input');
});

client.on('end', function() {
  console.log('disconnected from server');
});


function checkalive(){
  if(alive){
    
    if(x > 10){
      alive = false;
    }
    outString = x.toString();
    console.log(outString);

    client.write(outString);

    x++;
  
  }
}

var b = require('bonescript');
var analogVoltage = 0;

/* Check the sensor values every 2 seconds*/
setInterval(read, 2000);

function read(){
    b.analogRead('P9_40', printStatus);
}

function printStatus(x) {
    var distanceInches;
    analogVoltage = x.value*1.8; // ADC Value converted to voltage
    console.log('x.value = ' + analogVoltage); 
    distanceInches = analogVoltage / 0.00699;
    console.log("There is an object " + 
    parseFloat(distanceInches).toFixed(3) + " inches away.");
}

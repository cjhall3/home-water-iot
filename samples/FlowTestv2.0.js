#!/usr/bin/env node
var b = require('bonescript');

var sensorInput = "P9_19";

var  calibrationFactor = 4.5; //Pulses per liter - (based on your flow meter)
var  pulseCount        = 0;
var  flowRate          = 0.0;
var  flowMilliLitres   = 0;
var  totalMilliLitres  = 0;

var attached = false;

console.log("Please connect the digital sensor output to " + sensorInput);

b.pinMode(sensorInput, b.INPUT) || die("Failed to set pin mode");
b.attachInterrupt(sensorInput, true, b.FALLING, pulseCounter) || die("Failed to attached interrupt");

setInterval(loop, 1000);

// Only process PulseCounters once per second
function loop() {
  console.log("pulses:", pulseCount);
    b.detachInterrupt(sensorInput);
    flowRate = pulseCount / calibrationFactor;
    flowMilliLitres = (flowRate / 60)*1000;
    totalMilliLitres += flowMilliLitres;
   
    console.log("1-Flowrate: " + flowRate + "L/min\n");
    console.log("2-Current Liqud Flowing: " + flowMilliLitres + "mL/sec\n");
    console.log("3-Total Output: " + totalMilliLitres + "mL");
   
    pulseCount = 0;
    b.attachInterrupt(sensorInput, true, b.FALLING, pulseCounter) || die("Failed to attached interrupt");
}

function pulseCounter(val){

  if (val.attached) {
    attached = true;
    console.log("Attached!");
  } else if(attached) {
      ++pulseCount;
  } else {
      die("Handler did not attach properly");
  }
}

function detach() {
  if (attached) {
    attached = false;
    console.log("Detaching handler");
    b.detachInterrupt(sensorInput);
  }
}


function die(msg) {
  console.log(msg);
  detach();
  process.exit(1);
}
#!/usr/bin/env node

var b = require("bonescript");
var input = "P9_19";
var duration = 10000;
var pulseCount = 0;
var attached = false;

console.log("Please connect the digital sensor output to " + input);

b.pinMode(input, b.INPUT) || die("Failed to set pin mode");
b.attachInterrupt(input, true, b.RISING, handler) || die("Failed to attached interrupt");
setTimeout(detach, duration);

function handler(val) {
    if (val.attached) {
        attached = true;
        console.log("Attached!");
    } else if(attached) {
        console.log("PING " + ++pulseCount);
    } else {
        die("Handler did not attach properly: " + val.err);
    }
}

function detach() {
    if (attached) {
        attached = false;
        console.log("Detaching handler");
        b.detachInterrupt(input);
    }
}

function die(msg) {
    detach();
    console.error(msg);
    process.exit(1);
}

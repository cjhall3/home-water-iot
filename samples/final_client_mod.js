// --------------------------BONESCRIPT MODULES--------------------------

var b = require("bonescript");
var net = require("net");
console.log( "" );
console.log( "----------INITIALIZING STARTUP----------" );

// --------------------------INITIALIZE VARIABLES------------------------

// Faucet info
var faucet_id = process.argv[2];
console.log( "   FAUCET: " + faucet_id );

// Server info
var server_ip = "192.168.1.1";
console.log( "   SERVER IP ADDR: " + server_ip );

// Motor pinout
var motor_pin    = "P9_12";
var LOW          = 0;
var HIGH         = 1;
console.log( "   MOTOR PIN: " + motor_pin );

// Flow sensor pinout and calibration values
var flow_pin           = "P9_19";
var calibration_factor = 7.1;
var pulse_count        = 0;
var flow_rate          = 0.0;
var flow_mL            = 0;
var total_mL           = 0;
var attached           = false;
console.log( "   FLOW PIN: " + flow_pin );

// Buffer for messages
var buf = "";

// -------------------------------MAIN CODE------------------------------

console.log( "----------------------------------------" );

var client = net.connect( 8124, server_ip, function() {
	console.log( "Connected to server..." );
});

b.pinMode( motor_pin, b.OUTPUT ) || die( "[ERROR] Failed to set motor_pin..." );
b.digitalWrite( motor_pin, LOW );

b.pinMode( flow_pin, b.INPUT ) || die( "[ERROR] Failed to set flow_pin..." );
b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin interrupt handler..." );

setInterval( loop, 1000 );
// --------------------------FUNCTION DECLARATIONS-----------------------

client.on( "data", function( data ) {
	buf += data.toString();
	var d_index = buf.indexOf( ";" );

	// No delimiter, return
	if( d_index == -1 ) {
		return;
	}

	var server_response = buf.substring( 0, d_index );
	buf = buf.substring( d_index + 1 );

	if( server_response === "OK" ) {
		console.log( "Water Used: [" + parseFloat( total_mL ).toFixed( 2 ) + "] --> OK" );
                b.digitalWrite( motor_pin, HIGH );
	}
	else if( server_response === "STOP" ) {
		console.log( "Water Used: [" + parseFloat( total_mL ).toFixed( 2 ) + "] --> STOP" );
		b.digitalWrite( motor_pin, LOW );
	}
	else if( server_response === "RESET" ) {
		total_mL = 0;		
		console.log( "Water Used: [" + parseFloat( total_mL ).toFixed( 2 ) + "] --> RESET" );
                b.digitalWrite( motor_pin, HIGH );
	}
	else {
		console.log( "Other message received. Cannot interpret..." );
	}
});

client.on( "end", function() {
	console.log( "disconnected from server" );
});

function loop() {
  b.detachInterrupt( flow_pin );
  flow_rate = pulse_count / calibration_factor;
  flow_mL = ( flow_rate / 60 )*1000;
  total_mL += flow_mL;

  client.write( faucet_id + "," + total_mL.toString() + ";" );
   
  pulse_count = 0;
  b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin handler..." );
}

function pulseCounter( val ){
  if ( val.attached ) {
    attached = true;
  } else if( attached ) {
      ++pulse_count;
  } else {
      die("[ERROR] Flow sensor handler did not attach...");
  }
}

function detach() {
  if ( attached ) {
    attached = false;
    console.log( "Detaching flow sensor handler..." );
    b.detachInterrupt( flow_pin );
  }
}

function die( msg ) {
  console.log( msg );
  detach();
  process.exit( 1 );
}
// -------------------------------CODE END-------------------------------

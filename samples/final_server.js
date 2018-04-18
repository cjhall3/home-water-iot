// --------------------------BONESCRIPT MODULES--------------------------

var b = require( "bonescript" );
var net = require( "net" );
console.log( "" );
console.log( "----------INITIALIZING STARTUP----------" );

// --------------------------INITIALIZE VARIABLES------------------------

// Flow sensor pinout and calibration values
var flow_pin           = "P9_19";
var calibration_factor = 4.5;
var pulse_count        = 0;
var flow_rate          = 0.0;
var flow_mL            = 0;
var total_mL           = 0;
var attached           = false;
var FLOW_MAX           = 2000;
console.log( "   FLOW PIN: " + flow_pin );

// Ultrasonic sensor pinout
var ultrasonic_pin             = "P9_39";
var ultrasonic_distance        = 0;
var ultrasonic_distance_factor = 1.8 / 0.00699;
var critical_level             = 14;
var critical_tolerance         = 1;
console.log( "   ULTRASONIC PIN: " + ultrasonic_pin );

// Server command strings
var OK    = "OK";
var STOP  = "STOP";
var RESET = "RESET";

// Faucet variables
var faucet_A_client = null;
var faucet_B_client = null;
var faucet_A_usage = 0;
var faucet_B_usage = 0;

// -------------------------------MAIN CODE------------------------------

console.log( "----------------------------------------" );

var server = net.createServer( function( c ) {
    console.log( "Faucet connected: " + c );

    c.on( "data", function( data ) {
        var response = data.toString().split( "," );
	var faucet_id = response[ 0 ];
	var faucet_flow_read = response[ 1 ];

        if( faucet_id === "A" && faucet_A_client == null ) {
            faucet_A_client = c;
        }
        else if( faucet_id === "B" && faucet_B_client == null ) {
            faucet_B_client = c;
        }

	if( faucet_flow_read >= FLOW_MAX ) {
		console.log( "Faucet " + faucet_id + "has used up all its available water..." );
                c.write( "STOP" );
	}
	else {
                c.write( "OK" );
	}
    });

    c.on( "end", function() {
        console.log( "Faucet disconnected: " + c );
    });
});

server.listen( 8124, function() {
  console.log( "Server is launched..." );
});

b.pinMode( flow_pin, b.INPUT ) || die( "[ERROR] Failed to set flow_pin..." );
b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin interrupt handler..." );

setInterval( loop, 1000 );

setInterval( resetQuota, 1000 * 60 );
// --------------------------FUNCTION DECLARATIONS-----------------------

function resetQuota() {
  // TODO: send RESET signal to clients
  // TODO: 
  console.log( "Quota for water usage expired. Resetting..." );
}

function loop() {
  b.detachInterrupt( flow_pin );
  flow_rate = pulse_count / calibration_factor;
  flow_mL = ( flow_rate / 60 )*1000;
  total_mL += flow_mL;

  b.analogRead( ultrasonic_pin, updateWaterLevel );

  pulseCount = 0;
  b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin handler..." );
}

function updateWaterLevel( voltage ) {
  ultrasonic_distance = voltage * ultrasonic_distance_factor;
}

function pulseCounter( val ){
  if ( val.attached ) {
    attached = true;
    console.log( "Flow sensor handler attached..." );
  } else if( attached ) {
      ++pulseCount;
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

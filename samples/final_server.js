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
var flow_max           = FLOW_MAX;
console.log( "   FLOW PIN: " + flow_pin );

// Ultrasonic sensor pinout
var ultrasonic_pin             = "P9_39";
var ultrasonic_distance        = 0;
var ultrasonic_distance_factor = 1.8 / 0.00699;
var critical_level             = 14;
var empty_level                = 2.7;
var full_level                 = 18.9;
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

// State of the water supply
var conservative_mode = false;
var is_empty = false;

// -------------------------------MAIN CODE------------------------------

console.log( "----------------------------------------" );

var server = net.createServer( function( c ) {
    console.log( "Faucet connected, evaluating id... " );

    c.on( "data", function( data ) {
        var response = data.toString().split( "," );
	var faucet_id = response[ 0 ];
	var faucet_flow_read = response[ 1 ];

        // Add sanity check to parsing flow read; it could be bogus
        var parsed_read = parseFloat( faucet_flow_read );
        if( !isNaN( parsed_read ) ) {
            total_mL -= parsed_read;
        }

        // Assign faucets
        if( faucet_id === "A" && faucet_A_client == null ) {
            console.log( "Faucet A connected..." );
            faucet_A_client = c;
            faucet_A_client.on( "end", function() {
                console.log( "Faucet A disconnected..." );
                faucet_A_client = null;
            });
        }
        else if( faucet_id === "B" && faucet_B_client == null ) {
            console.log( "Faucet B connected..." );
            faucet_B_client = c;
            faucet_B_client.on( "end", function() {
                console.log( "Faucet B disconnected..." );
                faucet_B_client = null;
            });
        }

        // Check faucet reading with the maximum threshold for water use
        if( faucet_id === "A" && faucet_flow_read >= flow_max ) {
            console.log( "Stopping faucet A..." );
            faucet_A_client.write( "STOP" );
        }
        else if( faucet_id === "B" && faucet_flow_read >= flow_max ) {
            console.log( "Stopping faucet B..." );
            faucet_B_client.write( "STOP" );
        }
        else {
            c.write( "OK" );
        }
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
    console.log( "Quota for water usage expired. Resetting..." );
    if( faucet_A_client != null ) {
        faucet_A_client.write( "RESET" );
    }
    if( faucet_B_client != null ) {
        faucet_B_client.write( "RESET" );
    }
}

function loop() {
    b.detachInterrupt( flow_pin );
    flow_rate = pulse_count / calibration_factor;
    flow_mL = ( flow_rate / 60 )*1000;
    total_mL += flow_mL;
    
    b.analogRead( ultrasonic_pin, updateWaterLevel );

    // Assess the water level, and change state depending on it
    if( ultrasonic_distance <= bottom_level ) {
        // Shut down the system, until the water level fills past the critical level
        is_empty = true;
    }
    else if( ultrasonic_distance <= critical_level ) {
        // Go into "conservative mode" if no water is coming into the system
        // Otherwise, continue as normal
        if( flow_rate == 0 ) {
            conservative_mode = true;
            flow_max = ( total_mL - 500 ) / 2;
        }
    }
    else {
        // Proceed as normal
        conservative_mode = false;
        is_empty = false;
        flow_max = FLOW_MAX;
    }
    
    pulseCount = 0;
    b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin handler..." );
}

function updateWaterLevel( voltage ) {
    ultrasonic_distance = voltage * ultrasonic_distance_factor;
}

function pulseCounter( val ){
    if ( val.attached ) {
        attached = true;
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

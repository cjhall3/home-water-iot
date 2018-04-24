// --------------------------BONESCRIPT MODULES--------------------------

var b = require( "bonescript" );
var net = require( "net" );
console.log( "" );
console.log( "----------INITIALIZING STARTUP----------" );

// --------------------------INITIALIZE VARIABLES------------------------

// Flow sensor pinout and calibration values
var flow_pin           = "P9_19";
var calibration_factor = 7.1;
var pulse_count        = 0;
var flow_rate          = 0.0;
var flow_mL            = 0;
var total_mL           = 0;
var attached           = false;
var FLOW_MAX           = 2000;
var flow_max           = FLOW_MAX;
var critical_level     = 9000;
var empty_level        = 2000;
console.log( "   FLOW PIN: " + flow_pin );

// Ultrasonic sensor pinout
var ultrasonic_pin                = "P9_40";
var ultrasonic_distance           = 0;
var ultrasonic_distance_slope     = 1210;
var ultrasonic_distance_intercept = -19.021;
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

// State of the main water supply
var is_normal   = false;
var is_critical = false;
var is_empty    = false;

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
        // NOTE: added (-100) due to latency in motors
        if( faucet_id === "A" && faucet_flow_read >= flow_max - 100 ) {
            console.log( "Stopping faucet A..." );
            faucet_A_client.write( "STOP" );
        }
        else if( faucet_id === "B" && faucet_flow_read >= flow_max - 100 ) {
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

b.pinMode( flow_pin, b.INPUT, undefined, undefined, undefined, function(d) {console.error(">>>", d);} ) || die( "[ERROR] Failed to set flow_pin..." );
b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin interrupt handler..." );

setInterval( loop, 1000 );

setInterval( resetQuota, 1000 * 60 );

// --------------------------FUNCTION DECLARATIONS-----------------------

function resetQuota() {
    // Do not reset the quota if the system is not in "normal" mode
    if( !is_normal ) {
        return;
    }

    // Otherwise, assume the system is in "normal" mode
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
    if( total_mL < empty_level ) {
        is_normal = false;
        is_critical = false;
        is_empty = true;
        flow_max = 0;
    }
    else if( total_mL >= empty_level && total_mL < critical_level ) {
        is_normal = false;
        is_critical = true;
        is_empty = false;
        flow_max = ( total_mL - empty_level ) / 2;
    }
    else {
        is_normal = true;
        is_critical = false;
        is_empty = false;
        flow_max = FLOW_MAX;
    }

    console.log( "State: [" + (is_normal ? "  NORMAL" : (is_critical ? "CRITICAL" : "   EMPTY")) +
        "], Total Volume: " + total_mL + " mL" ); 
    
    pulse_count = 0;
    b.attachInterrupt( flow_pin, true, b.FALLING, pulseCounter ) || die( "[ERROR] Failed to set flow_pin handler..." );
}

function updateWaterLevel( voltage ) {
    ultrasonic_distance = voltage * ultrasonic_distance_slope + ultrasonic_distance_intercept;
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

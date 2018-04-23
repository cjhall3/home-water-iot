var io = require("../../utils/io");

var Valve = function(pin) {
    this._pin = pin;
    this.state = Valve.state.INIT;
}

Valve.prototype = {
    setup: function() {
        return io.pinMode(this._pin, io.OUTPUT);
    },

    shutdown: function() {
        // None
    },

    open: function() {
        this.state = Valve.state.OPEN;
        return io.digitalWrite(this._pin, io.HIGH);
    },

    close: function() {
        this.state = Valve.state.CLOSED;
        return io.digitalWrite(this._pin, io.LOW);
    }
};


Valve.state = { INIT: "INITIAL", OPEN: "OPEN", CLOSED: "CLOSED" };

module.exports = Valve;

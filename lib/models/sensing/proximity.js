var io = require("../../utils/io");

var Proximity = function(pin) {
    this._pin = pin;
};

Proximity.prototype = {
    DISTANCE_FACTOR: 1.8 / 0.00699,

    setup: function() {
        return io.pinMode(this._pin, io.INPUT);
    },

    shutdown: function() {
        // None
    },

    readDistance: function() {
        return io.analogRead(this._pin)
            .then(voltage => voltage * this.DISTANCE_FACTOR);
    }
};

module.exports = Proximity;

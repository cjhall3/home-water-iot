var io = require("../../utils/io.js");

var Flow = function(pin) {
    this._pin = pin;
    this._pulseCount = 0;
}

Flow.prototype = {
    setup: function() {
        return io.pinMode(this._pin, io.INPUT)
            .then(() => io.attachInterrupt(this._pin, true, io.FALLING, this._handlePulse));
    },

    shutdown: function() {
        return io.detachInterrupt(this._pin);
    },

    reset: function() {
        this.pulseCount = 0;
    },

    getPulseCount: function() {
        return this.pulseCount;
    },

    getFlowAmount: function() {
        return this.pulseCount * Flow.PULSES_PER_LITER;
    },

    _handlePulse: function() {
        this.pulseCount++;
    }
};

Flow.PULSES_PER_LITER = 7.1; // TODO

module.exports = Flow;

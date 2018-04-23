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
        this._pulseCount = 0;
    },

    getPulseCount: function() {
        return this._pulseCount;
    },

    getFlowAmount: function() {
        return this._pulseCount * Flow.PULSES_PER_LITER;
    },

    _handlePulse: function() {
        this._pulseCount++;
    }
};

Flow.PULSES_PER_LITER = 7.1; // TODO

module.exports = Flow;

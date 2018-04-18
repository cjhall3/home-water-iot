// var b = require("bonescript");

var TankControl = function(faucet, config) {
    this.waterUsage = 0;

    // Private vars
    this._faucet = faucet;
    this._config = config;
}

TankControl.prototype = {
    resetWater: function() {
        this.waterUsage = 0;
    },

    readLevel: function() {
        return new Promise((accept, reject) => {
            accept(20);
            return;

            // TODO: Implement sensor reading
            b.analogRead(this._config.sensorPin, accept);
        });
    }
}

module.exports = TankControl;

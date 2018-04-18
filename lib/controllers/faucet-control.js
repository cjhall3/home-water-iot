// var b = require("bonescript");

var FaucetControl = function(faucet, config) {
    this.waterUsage = 0;

    // Private vars
    this._faucet = faucet;
    this._config = config;
}

FaucetControl.prototype = {
    openValve: function() {
        // TODO: Something like this:
        // this._faucet.valve.state = "open"
        this._faucet.open = false;
        return new Promise((accept, reject) => {
            // b.digitalWrite(this._config.openPort, b.ON, accept);
            // b.digitalWrite(this._config.closePort, b.OFF, accept);
            accept();
        });
    },

    closeValve: function() {

    },

    resetWater: function() {
        this.waterUsage = 0;
    }
}

module.exports = FaucetControl;

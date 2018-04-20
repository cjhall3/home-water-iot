var io = require("../utils/io.js");
var Valve = require("./actuation/valve");
var Flow = require("./sensing/flow");

var Faucet = function(config) {
    this._totalWaterUsage = 0;
    this._reportedWaterUsage = 0;
    this._valve = new Valve(config.valvePin);
    this._flow = new Flow(config.flowPin);

    this._intervals = [];
};

Faucet.prototype = {
    setup: function() {
        return Promise.all([
            this._valve.setup(),
            this._flow.setup()
        ]);
    },

    shutdown: function() {
        this._intervals.forEach(clearInterval);

        return Promise.all([
            this._valve.shutdown(),
            this._flow.shutdown()
        ]);
    },

    openValve: function() {
        return this._valve.open();
    },

    closeValve: function() {
        return this._valve.close();
    },

    resetUsage: function(preserve) {
        this.waterUsage = 0;
    },

    // Handle data from server
    onData: function(onData) {
        throw new Error("UNIMPLEMENTED");

        // TODO: Write code for receive, handling, and responding to server data
    },

    onDisconnect: function() {
        // TODO
        throw new Error("UNIMPLEMENTED");
    },

    _update: function() {
        // TODO Write code that will run on a loop
    }

};

module.exports = Faucet;

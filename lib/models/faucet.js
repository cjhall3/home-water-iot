var io = require("../utils/io.js");
var Valve = require("./actuation/valve");
var Flow = require("./sensing/flow");

var Faucet = function(config) {
    console.info("Initializing faucet");

    this._totalWaterUsage = 0;
    this._reportedWaterUsage = 0;
    this._valve = new Valve(config.valvePin);
    this._flow = new Flow(config.flowPin);
    this._intervals = [];
    this._socket = null;
};

Faucet.prototype = {
    setup: function() {
        console.info("Setting up faucet");
        return Promise.all([
                this._valve.setup(),
                this._flow.setup()
            ])
    },

    start: function() {
        this._intervals.push(setInterval(this._update.bind(this), 1000));
        return Promise.resolve();
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

    setSocket: function(socket) {
        this._socket = socket;
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

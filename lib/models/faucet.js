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
            ]);
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

    resetUsage: function() {
        this._totalWaterUsage -= this._reportedWaterUsage;
        this._reportedWaterUsage = 0;
    },

    reportUsage: function() {
        this._socket.write(this._totalWaterUsage);
        this._reportedWaterUsage = this._totalWaterUsage;
    },

    setSocket: function(socket) {
        this._socket = socket;
    },

    onData: function(data) {
        var response = JSON.parse(data);

        if (response.quota || response.quota === 0) {
            this._quota = response._quota;
        }

        if (response.reset) {
            this.resetUsage();
            this.openValve();
        }

        if (response.stop) {
            this.closeValve();
        }

    },

    onDisconnect: function() {
        throw new Error("UNIMPLEMENTED");
    },

    _update: function() {
        this._totalWaterUsage += this._flow.getFlowAmount();
        this._flow.reset();

        if (this._totalWaterUsage >= this._quota) {
            this.closeValve();
        } else {
            this.openValve();
        }

        this._reportUsage();
    }

};

module.exports = Faucet;

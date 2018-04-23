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
        return this._valve.open();
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
        var data = {
            usage: this._totalWaterUsage,
            state: this._valve.state
        };
        console.info("Reporting:", data);
        this._socket.write(JSON.stringify(data));
        this._reportedWaterUsage = this._totalWaterUsage;
    },

    setSocket: function(socket) {
        this._socket = socket;
    },

    onData: function(data) {
        var response = JSON.parse(data);

        if (response.quota || response.quota === 0) {
            console.info("Setting quota:", response.quota);
            this._quota = response._quota;
        }

        if (response.reset) {
            console.info("Reseting usage");
            this.resetUsage();
            this.openValve();
        }

        if (response.stop) {
            console.info("Closing valve at server's command");
            this.closeValve();
        }
    },

    onDisconnect: function() {
        this._socket = null;
        throw new Error("Disconnected!");
    },

    _update: function() {
        var usage = this._flow.getFlowAmount();
        console.info("Added usage:", usage)
        this._totalWaterUsage += usage;
        this._flow.reset();

        if (this._totalWaterUsage >= this._quota) {
            this.closeValve();
        }

        this.reportUsage();
    }

};

module.exports = Faucet;

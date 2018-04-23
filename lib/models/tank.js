var Flow = require("./sensing/flow");
var Proximity = require("./sensing/proximity");
var User = require("./user");

var Tank = function(config) {
    console.info("Initializing tank");

    this._flow = new Flow(config.flowPin);
    this._proximity = new Proximity(config.proximityPin);
    this._users = new Map();
    this._mode = Tank.modes.INITIAL;
    this._intervals = [];

    // Bucket-specific variables
    this._maxProximityReading = config.maxProximityReading;
    this._maxDepth = config.maxDepth;
    this._maxVolume = this._depthToVolume(this._maxDepth);
    this._criticalVolume = this._maxVolume / 2;
    this._radius = config.diameter / 2;

    this._totalWaterInput = NaN;
    this._previousVolume = NaN;

    this._lastResetTime = NaN;

    // TODO: Configure
    this._normalWaterQuota = 2;
    this._cycleTime = 60 * 1000;
};

Tank.prototype = {
    setup: function() {
        console.info("Setting up tank");
        return Promise.all([
                this._flow.setup(),
                this._proximity.setup()
            ]);
    },

    start: function() {
        this._intervals.push(setInterval(this._update.bind(this), 1000));
        return Promise.resolve();
    },

    shutdown: function() {
        this._intervals.forEach(clearInterval);

        return Promise.all([
            this._flow.shutdown(),
            this._proximity.shutdown()
        ]);
    },

    currentWaterLevel: function() {
        return this._proximity.readDistance()
            .then(distance => {
                return (this._maxProximityReading - distance);
            });
    },

    currentVolume: function() {
        return this.currentWaterLevel()
            .then(level => this._depthToVolume(level));
    },

    onData: function(socket, data) {
        var id = socket.address().address;

        if (!this._users.has(id)) {
            // New IP address means new user
            this._users.set(id, new User(id));
        }

        var user = this._users.get(id);
        user.socket = socket;

        var usage = JSON.parse(data);
        user.waterUsage = usage;

        // Check faucet reading with the maximum threshold for water usage
        if (user.waterUsage >= user.quota ) {
            console.info( "Stopping faucet at " + id);
            user.notify({ stop: true });
        }
    },

    onDisconnect: function(socket) {
        var id = socket.address().address;
        var user = this._users.get(id);
        user.socket = null;
        console.warn("User " + id + " disconnected!");
    },

    _update: function() {
        if (this._mode === Tank.modes.INITIAL) {
            this._lastResetTime = Date.now();
        }

        var newWater = this._flow.getFlowAmount();
        this._totalWaterInput += newWater;
        this._flow.reset();

        return this.currentVolume()
            .then(vol => {
                if (this._mode === Tank.modes.INITIAL) {
                    if (this._isCritical(vol)) {
                        this._switchMode(Tank.modes.CRITICAL);
                    } else {
                        this._switchMode(Tank.modes.NORMAL);
                    }

                } else if (this._mode === Tank.modes.NORMAL) {
                    if (this._isCritical(vol)) {
                        // We've entered critical condition!
                        this._sendQuotas(vol, true);
                        this._switchMode(Tank.modes.CONSERVATIVE);
                    } else if (this._elapsedTime() < this._cycleTime) {
                        // Need to reset water usage
                        this._resetUsage();
                        this._sendQuotas({ quota: this._normalWaterQuota });
                    }
                } else if (this._mode === Tank.modes.CONSERVATIVE) {
                    if (this._isCritical(vol)) {
                        if (newWater) {
                            // If we received any new water, notify users
                            this._sendQuotas(newWater, true);
                        }
                    } else {
                        // Back to normal!
                        this._switchMode(Tank.modes.NORMAL);
                    }
                } else {
                    throw new Error("Unexpected mode");
                }
            });
    },

    _isCritical: function(volume) {
        return volume < this._criticalVolume;
    },

    _switchMode: function(mode) {
        console.info("Switching from " + this._mode + " to " + mode);
        this._mode = mode;
    },

    _elapsedTime: function() {
        return Date.now() - this._lastResetTime;
    },

    _sendQuotas: function(limit, isCritical) {
        console.info("Sending user quotas");

        this._users.forEach(user => {
            if (isCritical) {
                // Divide the remaining amount between all users
                user.quota += (limit / this._users.length)
                user.notify({ quota: user.quota, reset: false });
            } else {
                // Users should reset to this amount
                user.quota = limit;
                user.notify({ quota: user.quota, reset: true });
            }
        });
    },

    _resetUsage: function() {
        console.info("Reseting time period");

        this._lastResetTime = Date.now();
        this._users.forEach(user => {
            user.waterUsage = 0;
        });
    },

    _depthToVolume: function(d) {
        return Math.PI * this._radius * this._radius * d;
    },

    _volumeToDepth: function(v) {
        return v / (Math.PI * this._radius * this._radius);
    }
}

Tank.modes = { INITIAL: "INITIAL", NORMAL: "NORMAL", CONSERVATIVE: "CONSERVATIVE" };

module.exports = Tank;

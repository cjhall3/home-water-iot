var Flow = require("./sensing/flow");
var Proximity = require("./sensing/proximity");

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
};

Tank.prototype = {
    setup: function() {
        console.info("Setting up tank");
        return Promise.all([
                this._flow.setup(),
                this._proximity.setup()
            ])
    },

    start: function() {
        this._intervals.push(setInterval(this._update.bind(this), 1000));
        this._intervals.push(setInterval(this._resetUsage.bind(this), 1000 * 60));
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

        if (!this.users.has(id)) {
            // New IP address means new user
            this.users.set(id, new User(id));
        }

        var user = this.users.get(id);
        user.socket = socket;

        throw new Error("UNIMPLEMENTED");
        // TODO: Write code for receive, handle, and respond to data from clients
    },

    onDisconnect: function(socket) {
        // TODO: Handle dropouts. Probably attribute all missing water to them
        throw new Error("UNIMPLEMENTED");
    },

    _update: function() {
        return this.currentVolume()
            .then(vol => {
                // TODO: compare with _criticalVolume, send commands
                switch(this._mode) {
                    case Tank.modes.INITIAL:
                        break;
                    case Tank.modes.NORMAL:
                        break;
                    case Tank.modes.CONSERVATIVE:
                        break;
                    default:
                        throw new Error("Unexpected mode");
                }
            })
    },

    _resetUsage: function() {
        this._users.forEach(u => u.socket.write("RESET"));
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

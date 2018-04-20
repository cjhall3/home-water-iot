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

    this._totalWaterInput;
    this._previousVolume = NaN;
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

        var response = data.toString();
        var usage = +response;

        //  Make sure it actually is a number
        if(!isNaN(usage)) {
            user.waterUsage = usage;
        }

        // Check faucet reading with the maximum threshold for water use
        if(user.waterUsage >= user.quota ) {
            console.info( "Stopping faucet at " + id);
            socket.write( "STOP" );
        } else {
            c.write( "OK" );
        }
    },

    onDisconnect: function(socket) {
        // TODO: Handle dropouts. Probably attribute all missing water to them
        throw new Error("UNIMPLEMENTED");
    },

    _update: function() {
        // TODO: Monitor this value and make sure user's usages make sense
        this._totalWaterInput += this._flow.getFlowAmount();
        this._flow.reset();

        return this.currentVolume()
            .then(vol => {
                with(Tank.modes) {
                    switch(this._mode) {
                        case INITIAL:
                            this._mode = vol < this._criticalVolume ? CRITICAL : NORMAL;
                            console.info("Starting in " + this._mode + " mode");
                            break;
                        case NORMAL:
                            // Check if we are in critical conditions
                            if (vol < this._criticalVolume) {
                                this._users.forEach(u => u.quota = vol / 2);

                                // TODO: Notify users of new mode / quota

                                this._mode = CONSERVATIVE;
                                console.info("Entering " + this._mode + " mode");
                            }
                            break;
                        case CONSERVATIVE:
                            // TODO:
                            // Check if we are back to normal
                            // Update user quotas (maybe we got some extra water)
                            // Maybe ask users to stop
                            break;
                        default:
                            throw new Error("Unexpected mode");
                    }
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

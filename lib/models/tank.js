var Tank = function(config) {
    this._flow = new Flow(config.flowPin);
    this._proximity = new Proximity(config.proximityPin);
    this._users = new Map();
    this._maxHeight = config.maxHeight;
    this._maxVolume = this.heightToVolume(this._maxHeight);
    this._criticalVolume = this._maxVolume / 2;
    this._mode = Tank.modes.INITIAL;
    this._intervals = [];
};

Tank.prototype = {
    setup: function() {
        return Promise.all([
                this._flow.setup(),
                this._proximity.setup()
            ])
            .then(() => {
                this._intervals.push(setInterval(this._update.bind(this), 1000));
                this._intervals.push(setInterval(this._reset.bind(this), 1000 * 60));
            });
    },

    shutdown: function() {
        this._intervals.forEach(clearInterval);

        return Promise.all([
            this._flow.shutdown(),
            this._proximity.shutdown()
        ]);
    },

    currentWaterLevel: function() {
        return this._proximity.read()
            .then(distance => {
                return this._height - distance;
            });
    },

    currentVolume: function() {
        return this.currentWaterLevel()
            .then(height => this.heightToVolume(height));
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
    }
}

Tank.modes = { INITIAL: "INITIAL", NORMAL: "NORMAL", CONSERVATIVE: "CONSERVATIVE" };

module.exports = Tank;

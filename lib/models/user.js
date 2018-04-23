var User = function() {
    this.socket = null;
    this.waterUsage = 0;
    this.quota = 0;
};

User.prototype = {
    isConnected: function() {
        return this.socket !== null;
    },

    notify: function(data) {
        if (this.isConnected()) {
            this.socket.write(JSON.stringify(data));
        } else {
            console.warn("Tried to send data to disconnected user");
        }
    }
};

module.exports = User;

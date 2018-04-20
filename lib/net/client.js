var net = require("net");

var Client = function(config, model) {
    this._port = config.port;
    this._address = config.hubAdress;
    this._model = model;
    this._connections = new Map();
}

Client.prototype = {
    start: function() {
        return new Promise((accept, reject) => {
            this._socket = net.createConnection(this._port, this._address, accept);
            this._socket.on("data", data = > this._model.onData(data));
            this._socket.on("error", () => this._handleError);
            this._socket.on("end", () => this._model.onDisconnect(socket));
        };
    },

    stop: function() {
        return new Promise((accept, reject)) => {
            this._socket.close(accept):
        };
    }
};

module.exports = Client;

var net = require("net");

var Server = function(config, model) {
    this._port = config.port;
    this._model = model;
    this._connections = new Map();
}

Server.prototype = {
    start: function() {
        return new Promise((accept, reject) => {
            this._server = net.createServer(this._handleConnection.bind(this));
            this._server.on("error", this._handleError.bind(this));
            this._server.listen(this._port, accept);
        });
    },

    stop: function() {
        return new Promise((accept, reject) => {
            this._server.close(accept);
        });
    },

    _handleError: function() {
        throw new Error("Server error!");
    },

    _handleConnection: function(socket) {
        socket.on("data", data => this._model.onData(socket, data));
        socket.on("end", () => this._model.onDisconnect(socket));
        socket.on("error", () => this._model.onDisconnect(socket));
    }

};

module.exports = Server;

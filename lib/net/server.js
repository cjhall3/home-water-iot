var net = require("net");

var Server = function(config, model) {
    console.info("Initializing server");
    this._port = config.port;
    this._model = model;
    this._connections = new Map();
    this._server = null;
}

Server.prototype = {
    start: function() {
        console.info("Starting server");
        return new Promise((accept, reject) => {
            this._server = net.createServer(this._handleConnection.bind(this));
            this._server.on("error", this._handleError.bind(this));
            this._server.on("listening", this._handleListening.bind(this));
            this._server.on("close", this._handleClose.bind(this));
            this._server.listen(this._port, accept);
        });
    },

    stop: function() {
        return new Promise((accept, reject) => {
            this._server.close(accept);
        });
    },

    _handleConnection: function(socket) {
        console.info("Connection received");
        socket.on("data", data => this._model.onData(socket, data));
        socket.on("end", () => this._model.onDisconnect(socket));
        socket.on("error", () => this._model.onDisconnect(socket));
    },

    _handleError: function() {
        console.error("Server error!");
        throw new Error("Server error!");
    },

    _handleListening: function() {
        console.info("Listening on port " + this._port);
    },

    _handleClose: function() {
        console.info("Server closed");
    }
};

module.exports = Server;

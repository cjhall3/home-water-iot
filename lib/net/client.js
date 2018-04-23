var net = require("net");

var Client = function(config, model) {
    console.info("Initializing client");
    this._port = config.port;
    this._address = config.hubAdress;
    this._model = model;
    this._connections = new Map();
    this._socket = null;
};

Client.prototype = {
    start: function() {
        console.info("Starting client");
        return new Promise(accept => {
            this._socket = net.createConnection(this._port, this._address, accept);
            this._socket.on("data", data => this._model.onData(data));
            this._socket.on("end", this._handleEnd.bind(this));
            this._socket.on("close", this._handleClose.bind(this));
            this._socket.on("error", this._handleError.bind(this));
            this._model.setSocket(this._socket);
        });
    },

    stop: function() {
        return new Promise(accept => {
            this._socket.close(accept);
        });
    },

    _handleClose: function() {
        console.info("Connection closed");
        this._model.onDisconnect();
    },

    _handleConnect: function() {
        console.info("Connected to server");
    },

    _handleEnd: function() {
        console.info("Connection ended");
    },

    _handleError: function() {
        console.error("Socket encountered an error!");

        this._model.onDisconnect();
        throw new Error("Socket encountered an error!");
    }
};

module.exports = Client;

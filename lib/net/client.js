var net = require("net");

var Client = function(config, model) {
    console.info("Initializing client");
    this._port = config.port;
    this._address = config.hubAddress;
    this._model = model;
    this._socket = null;
    this._hasConnected = false;
};

Client.prototype = {
    start: function() {
        this._hasConnected = false;
        console.info("Starting client");
        return new Promise((accept, reject) => {
            this._socket = net.createConnection(this._port, this._adress, () => {
                this._hasConnected = true;
                accept();
            });
            this._socket.on("data", data => this._model.onData(data));
            this._socket.on("end", this._handleEnd.bind(this));
            this._socket.on("close", this._handleClose.bind(this));
            this._socket.on("error", err => {
                this._handleError();
                if (!this._hasConnected) {
                    reject(err)
                }
            });
            this._model.setSocket(this._socket);
        });
    },

    stop: function() {
        return new Promise(accept => {
            if (this._socket) {
                this._socket.close(accept);
                this._socket = null;
            } else {
                accept();
            }
        });
    },

    _handleClose: function() {
        console.info("Connection closed");
        this._socket = null;
        if (this._handleClose) {
            this._model.onDisconnect();
        }
    },

    _handleEnd: function() {
        console.info("Connection ended");
        this._socket = null;
        this._model.onDisconnect();
    },

    _handleError: function() {
        console.error("Socket encountered an error!");
        this._socket = null;
        this._model.onDisconnect();
        throw new Error("Socket encountered an error!");
    }
};

module.exports = Client;

var io = require("socket.io");

var Server = function() {
    this._io = io();
    this.users = 0;
}

Server.prototype = {
    addUser: function() {
        this.users++;
    }
   
    start {
        this._io.on('connection', 
    }
}

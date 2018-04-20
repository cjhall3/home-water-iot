var config = require("./utils/config");
var Server = require("./net/server");
var Client = require("./net/client");
var Faucet = require("./models/faucet");
var Tank = require("./models/tank");

module.exports = {
    getConfigurations: function() {
        return Promise.all([config.getSystemConfig(), config.getDeviceConfig()])
    },

    createController: function() {
        return this.getConfigurations()
            .then(([sysConfig, devConfig]) => {
                if (devConfig.type === config.types.TANK) {
                    return new Tank(devConfig);
                } else if (devConfig.type === config.types.FAUCET) {
                    return new Faucet(devConfig);
                } else {
                    throw new Error("Device not configured");
                }
            });
    },

    createNetworker: function(control) {
        return this.getConfigurations()
            .then(([sysConfig, devConfig]) => {
                if (devConfig.type === config.types.TANK) {
                    return new Server(sysConfig, control);
                } else if (devConfig.type === config.types.FAUCET) {
                    return new Client(sysConfig, control);
                } else {
                    throw new Error("Device not configured");
                }
            });
    }
}

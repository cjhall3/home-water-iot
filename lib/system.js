var config = require("./utils/config");
var Faucet = require("./models/faucet");
var Tank = require("./models/faucet");
var FaucetControl = require("./controllers/faucet-control");
var TankControl = require("./controllers/tank-control");

module.exports = {
    createController: function() {
        return Promise.all([config.getSystemConfig(), config.getDeviceConfig()])
            .then(([sysConfig, devConfig]) => {
                if (devConfig.type === config.types.FAUCET) {
                    // TODO: Configure with ports, etc.
                    var faucet = new Faucet();
                    return new FaucetControl(faucet, devConfig);
                } else if (devConfig.type === config.types.TANK) {
                    // TODO: Configure
                    var tank = new Tank();
                    return new TankControl(tank);
                } else {
                    throw new Error("Device config not set up properly");
                }
            });
    }
}

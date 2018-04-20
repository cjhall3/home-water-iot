var fs = require("fs-extra");
var root = require("app-root-path");

var configDir = root + "/config";
var deviceFile = configDir + "/device.json";
var sysFile = configDir + "/system.json";

var writeFile = (file, data) => fs.writeFile(file, JSON.stringify(data));
var readFile = (file) => fs.readFile(file)
                           .then(data => JSON.parse(data));

var deviceConfig, sysConfig;

module.exports = {
    types: {
        TANK: "Tank",
        FAUCET: "Faucet"
    },
    getSystemConfig: () => {
        if (!sysConfig) {
            return readFile(sysFile)
                .then(data => {
                    sysConfig = data;
                    return sysConfig;
                });
        }
        return Promise.resolve(sysConfig);
    },
    getDeviceConfig: () => {
        if (!deviceConfig) {
            return readFile(deviceFile)
                .then(data => {
                    deviceConfig = data;
                    return deviceConfig;
                });
        }
        return Promise.resolve(deviceConfig);
    },
    writeDeviceConfig: (data) => writeFile(deviceFile, data)
                                  .then(() => deviceConfig = data)
}

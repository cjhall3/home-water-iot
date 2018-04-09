var fs = require("fs-extra");
var root = require("app-root-path");

var configDir = root + "/config";
var userFile = configDir + "/device.json";
var sysFile = configDir + "/system.json";

var writeFile = (file, data) => fs.writeFile(file, JSON.stringify(data));
var readFile = (file) => fs.readFile(file)
                           .then(data => JSON.parse(data));

var userConfig, sysConfig;

module.exports = {
    getSystemConfig: () => {
        if (!sysConfig) {
            return readFile(sysFile)
                .then(data => {
                    sysConfig = data;
                    return Promise.resolve(sysConfig);
                });
        }
        return Promise.resolve(userConfig);
    },
    getUserConfig: () => {
        if (!userConfig) {
            return readFile(userFile)
                .then(data => {
                    userConfig = data;
                    return Promise.resolve(userData);
                });
        }
        return Promise.resolve(userConfig);
    },
    writeUserConfig: (data) => writeFile(userFile, data)
                                  .then(() => userData = data)
}

var prompt = require("inquirer").createPromptModule();
var config = require("./utils/config");

var isDigit = (d) => /^\d+$/.test(d);
var isByte = (d) => isDigit(d) && +d > 0 && +d < 256;
var isNum = (n) => /^\d+\.?(\d+)?$/.test(n);

var isFaucet = data => data.type === config.types.FAUCET;
var isTank = data => !isFaucet(data);

var questions = [{
    name: "type",
    message: "Select device type",
    choices: [config.types.TANK, config.types.FAUCET],
    type: "rawlist"
}, {
    name: "passphrase",
    message: "Enter network passphrase",
    type: "password"
}, {
    name: "id",
    message: "Enter a unique ID for this device (1-255)",
    validate: isByte,
    when: isFaucet,
}, {
    name: "name",
    message: "Enter a name for this device",
    when: isFaucet
}, {
    name: "flowPin",
    message: "Enter flow pin",
    default: "P9_19"
}, {
    name: "valvePin",
    message: "Enter valve pin",
    default: "P9_12",
    when: isFaucet
}, {
    name: "proximityPin",
    message: "Enter proximity pin",
    default: "P9_20",
    when: isTank
}, {
    name: "maxDepth",
    message: "Enter maximum water level (cm)",
    validate: isNum,
    when: isTank
}, {
    name: "maxProximity",
    message: "Enter distance from proximity sensor to bottom of tank (cm)",
    validate: isNum,
    when: isTank
}, {
    name: "diameter",
    message: "Enter diameter of tank (cm)",
    validate: isNum,
    when: isTank
}];

Promise.all([config.getSystemConfig(), prompt(questions)])
    .then(([sysData, data]) => {
        if (isFaucet(data)) {
            data.address = sysData.addressPrefix + data.id;
        } else {
            data.address = sysData.hubAddress;
        }
        return config.writeDeviceConfig(data);
    })
    .catch(reason => {
        console.error(reason);
    });

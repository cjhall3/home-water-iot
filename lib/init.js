var prompt = require("inquirer").createPromptModule();
var config = require("./utils/config");

var isDigit = (d) => /^\d+$/.test(d)
var isByte = (d) => isDigit(d) && +d > 0 && +d < 256

var isFaucet = data => data.type === config.types.FAUCET;
var isTank = data => !isFaucet(data)

var questions = [{
    name: "type",
    message: "Select device type",
    choices: [config.types.TANK, config.types.FAUCET],
    type: "rawlist"
}, {
    name: "id",
    message: "Enter a unique ID for this device (1-255)",
    validate: isByte,
    when: isFaucet,
}, {
    name: "password",
    message: "Enter network password",
    type: "password"
}];

// TODO: Prompt for port numbers

var sysData;
config.getSystemConfig()
    .then(data => {
        sysData = data;
        return prompt(questions);
    }).then(data => {
        if (isFaucet(data)) {
            data.address = sysData.addressPrefix + data.id;
        } else {
            data.address = sysData.hubAddress;
        }
        return config.writeUserConfig(data);
    }).catch(reason => {
        console.error(reason);
    });

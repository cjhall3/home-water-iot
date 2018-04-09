var prompt = require("inquirer").createPromptModule();
var config = require("./utils/config");

var isDigit = (d) => /^\d+$/.test(d)
var isByte = (d) => isDigit(d) && +d > 0 && +d < 256

var types = {
    HUB: "Hub",
    USER: "User"
};

var isUser = data => data.type === types.USER;

var questions = [{
    name: "type",
    message: "Select device type",
    choices: [types.HUB, types.USER],
    type: "rawlist"
}, {
    name: "id",
    message: "Enter a unique ID for this device (1-255)",
    validate: isByte,
    when: isUser
}, {
    name: "password",
    message: "Enter network password",
    type: "password"
}];

var sysData;
config.getSystemConfig()
    .then(data => {
        sysData = data;
        return prompt(questions);
    }).then(data => {
        if (isUser(data)) {
            data.address = sysData.addressPrefix + data.id;
        } else {
            data.address = sysData.hubAddress;
        }
        return config.writeUserConfig(data);
    }).catch(reason => {
        console.error(reason);
    });

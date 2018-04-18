var utils = require("./test-utils");
var connect = require("../lib/net/connect");

var ask = utils.ask;
var wait = utils.wait;
var print = utils.print;

var run = function(tank) {
    return Promise.resolve()
        .then(() => ask("Running tank tests. Please run faucet tests first. Continue?"))
        .then(() => tank.readLevel())
        .then(level => print("Proximity sensor measured " + level + " liters"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => ask("Please fill the input tank. Ready?"))
        .then(() => tank.resetWater())
        .then(() => ask("Open the manual input valve and wait for the water to stop. Finished?"))
        .then(() => print("Measured " + tank.waterUsage + " liters of flow"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => tank.readLevel())
        .then(level => print("Proximity sensor measured " + level + " liters"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => {
            print("Starting server...");
            return connect.asTank();
        })
        .then(() => {
            // TODO: Listen for two connections
            return wait(5000);
        })
        .then(() => {
            print("Connection successful");
            print("Opening valves...");
            // TODO: tell faucets to open
        })
        .then(() => wait(2000))
        .then(() => {
            print("Closing valves...");
            // TODO: tell faucets to close
        })
        .then(() => wait(5000))
        .then(() => ask("Did water exit both faucets?"))
        .then(() => {
            // TODO: ask faucets for water usage
            print("Measured ...");
            print("Measured ...");
        })
        .then(() => ask("Are these measurements accurate?"));
};

module.exports = run;

var utils = require("./test-utils");
var client = require("../lib/net/client");

var ask = utils.ask;
var wait = utils.wait;
var print = utils.print;

var run = function(faucet) {
    var client;

    return Promise.resolve()
        .then(() => ask("Running faucet tests. Continue?"))
        .then(() => {
            print("Attempting to close valve...");
            return faucet.closeValve();
        })
        .then(() => wait(5000))
        .then(() => ask("Please add two liters of water to the tank and open the manual valve. Ready?"))
        .then(() => {
            print("Opening valves");
            faucet.resetWater();
            return faucet.openValve();
        })
        .then(() => wait(2000))
        .then(() => {
            print("Closing valves");
            return faucet.closeValve();
        })
        .then(() => wait(5000))
        .then(() => ask("Did water briefly exit the faucet and then stop?"))
        .then(() => print("Measured " + faucet.waterUsage + " liters"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => ask("After running all faucet tests, run the tank tests. Finished?"))
        .then(() => config.getSystemConfig())
        .then(config => {
            print("Attempting to connect...");
            client = new Client(config, faucet);
            return client.start();
        })
        .then(() => ask("Connection success. Please continue when the water stops flowing."));
}

module.exports = run;

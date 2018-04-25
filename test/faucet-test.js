var utils = require("./test-utils");
var Client = require("../lib/net/client");
var config = require("../lib/utils/config");

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
            faucet.resetUsage();
            return faucet.openValve();
        })
        .then(() => wait(3000))
        .then(() => {
            print("Closing valves");
            return faucet.closeValve();
        })
        .then(() => wait(5000))
        .then(() => ask("Did water briefly exit the faucet and then stop?"))
        .then(() => print("Measured " + faucet._totalWaterUsage + " mL"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => ask("After running all faucet tests, please run the tank tests. Finished?"))
        .then(() => config.getSystemConfig())
        .then(conf => {
            print("Attempting to connect...");
            client = new Client(conf, faucet);
            return client.start();
        })
        .then(() => print("Connection success..."))
        .then(() => faucet.setup())
        .then(() => faucet._update())
        .then(() => wait(7000))
        .then(() => faucet._update())
        .then(() => wait(3000))
        .then(() => ask("Please continue when prompted by server."))
        .then(() => faucet.shutdown())
        .then(() => client.stop());
}

module.exports = run;

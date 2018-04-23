var utils = require("./test-utils");
var Server = require("../lib/net/server");

var ask = utils.ask;
var wait = utils.wait;
var print = utils.print;

var run = function(tank) {
    var server = null;

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
        .then(() => config.getSystemConfig())
        .then(config => {
            print("Starting server...");
            server = new Server(config, tank);
            return server.start();
        })
        .then(() => {
            print("Please press enter on both faucet beaglebones");
            print("Wating for connections...");
            var connections = 0;
            return new Promise(accept => {
                server._server.on("connection", () => {
                    connections++;
                    if (connections === 2) {
                        accept();
                    }
                });
            }
        })
        .then(() => {
            print("Connections successful");
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

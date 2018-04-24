var utils = require("./test-utils");
var config = require("../lib/utils/config");
var Server = require("../lib/net/server");

var ask = utils.ask;
var wait = utils.wait;
var print = utils.print;

var run = function(tank) {
    var server = null;

    return Promise.resolve()
        .then(() => ask("Running tank tests. Please run faucet tests first. Continue?"))
        .then(() => tank.currentWaterLevel())
        .then(level => print("Proximity sensor measured " + level + " centimeters"))
        .then(() => tank.currentVolume())
        .then(vol => print("Tank has " + vol + " mL"))
        .then(() => ask("Are these measurements accurate?"))
        .then(() => ask("Please fill the input tank. Ready?"))
        .then(() => tank._totalWaterInput = 0)
        .then(() => ask("Open the manual input valve and wait for the water to stop. Finished?"))
        .then(() => print("Measured " + tank._totalWaterInput + " mL of flow"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => tank.currentWaterLevel())
        .then(level => print("Proximity sensor measured " + level + " centimeters"))
        .then(() => tank.currentVolume())
        .then(vol => print("Tank has " + vol + " mL"))
        .then(() => ask("Is this measurement accurate?"))
        .then(() => config.getSystemConfig())
        .then(conf => {
            print("Starting server...");
            server = new Server(conf, tank);
            return server.start();
        })
        .then(() => ask("How many faucets are you using?", "input"))
        .then(num => {
            print("Please press enter on both faucet beaglebones");
            print("Wating for connections...");
            return new Promise(accept => {
                var connections = 0;
                server._server.on("connection", () => {
                    connections++;
                    console.log(connections, num);
                    if (connections === +num) {
                        accept();
                    }
                });
            });
        })
        .then(() => {
            print("Connections successful");
            print("Opening valves...");
            // Tank will automatically tell them to open
        })
        .then(() => wait(3000))
        .then(() => {
            print("Closing valves...");
            return tank._sendQuotas(0, false);
        })
        .then(() => wait(5000))
        .then(() => ask("Did water exit both faucets?"))
        .then(() => {
            tank._users.forEach(u => 
                print("Measured " + u.waterUsage + " mL for user " + u.socket.address().address)
            );
        })
        .then(() => ask("Are these measurements accurate?"))
        .then(() => ask("You may now end the faucet tests, then press enter"))
        .then(() => server.stop());
};

module.exports = run;

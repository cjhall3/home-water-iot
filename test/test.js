var config = require("../lib/utils/config");
var sys = require("../lib/system");

Promise.all([config.getDeviceConfig(), sys.createController()])
    .then(([conf, controller]) => {
        if (conf.type === config.types.FAUCET) {
            // Run faucet test
            test = require("./faucet-test")
        } else if (conf.type === config.types.TANK) {
            // Run tank test
            test = require("./tank-test")
        } else {
            throw new Error("Device config not set up properly");
        }

        return test(controller);
    })
    .then(() => console.log("Tests Passed!"))
    .catch(reason => {
        console.error("Tests Failed!");
        console.error(reason);
    });


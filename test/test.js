var config = require("../lib/utils/config");
var tankTest = require("./tank-test");
var faucetTest = require("./faucet-test");

config.getUserConfig()
    .then(conf => {
        if (conf.type === config.types.FAUCET) {
            // Run faucet test
            faucetTest()
        } else if (config.type === config.types.TANK) {
            // Run tank test
            tankTest()
        } else {
            console.error("Device not set up for config");
        }
    }).catch(reason => {
        console.error(reason);
    });


var system = require("../lib/system");
var exec = require("child_process").exec;

system.getConfigurations()
    .then(([sys, dev]) => {
        var commands = [
            "ifconfig wlan0 down",
            "iwconfig wlan0 mode ad-hoc",
            "iwconfig wlan0 essid " + sys.ssid,
            "iwconfig wlan0 key s:" + dev.passphrase,
            "ifconfig wlan0 " + dev.address + " netmask 255.255.255.0",
            "ifconfig wlan0 up"
        ];
        exec(commands.join(" && "), (err, stdout, stderr) => {
            if (err) {
                console.error(err);
            }
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
        });
    });

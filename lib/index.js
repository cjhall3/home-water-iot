var system = require("./system");

// Start program


var controller, networker;

system.createController()
    .then(c => {
        controller = c;
        return system.createNetworker(c);
    })
    .then(n => {
        networker = n;
        return n.start()
    })
    .then(() => controller.setup())
    .then(() => controller.start())
    .catch(reason => {
        console.error("Something went wrong!");
        console.error(reason);
        if (controller) {
            controller.shutdown();
        }
        if (networker) {
            networker.stop();
        }
    });


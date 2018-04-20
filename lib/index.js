var system = require("./system");

// Start program

system.createController()
    .then(c => system.createNetworker(c))
    .then(n => n.start())
    .catch(reason => {
        console.error("Something went wrong!");
        console.error(reason);
    });


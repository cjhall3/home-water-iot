var prompt = require("inquirer").createPromptModule();

var ask = function(text) {
    var question = {
        name: "test",
        message: text,
        type: "confirm"
    };
    return prompt([question])
        .then(answers => {
            if (!answers.test) {
                throw new Error("Confirmation required to continue");
            }
        });
};

var wait = function(time) {
    return new Promise((accept, reject) => setTimeout(accept, time));
}

var run = function() {
    return Promise.resolve()
        .then(() => ask("First Test. Continue?"))
        .then(() => {
            console.log("Opening Valves");
            return wait(2000);
        })
        .then(() => ask("Valves open?"))
        .then(() => {
            console.log("Closing Valves");
            return wait(1000);
        })
        .then(() => ask("Valves closed?"))
        .then(() => console.log("Tests Passed!"))
        .catch(reason => {
            console.error("Tests failed");
            console.error(reason);
        });
}

module.exports = run;

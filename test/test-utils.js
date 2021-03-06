var prompt = require("inquirer").createPromptModule();

module.exports = {
    ask: function(text, type) {
        var question = {
            name: "test",
            message: text,
            type: type ? type : "confirm"
        };
        return prompt([question])
            .then(answers => {
                if (!answers.test) {
                    throw new Error("Confirmation required to continue");
                }
                return answers.test;
            });
    },

    wait: function(time) {
        return new Promise((accept, reject) => setTimeout(accept, time));
    },

    print: function() {
        console.log.apply(null, arguments);
    }
}

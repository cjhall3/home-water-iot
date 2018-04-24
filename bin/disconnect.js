var exec = require("child_process").exec;

var commands = [
    "connmanctl disable wifi",
    "connmanctl enable wifi"
]
exec(commands.join(" && "), (err, stdout, stderr) => {
    if (err) {
	console.error(err);
    }
    console.log("stdout: " + stdout);
    console.log("stderr: " + stderr);
});

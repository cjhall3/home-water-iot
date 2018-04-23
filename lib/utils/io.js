var b = require("bonescript");

//
// Wraps asyncronous bonescript functions with promises
//

var _promisify = function(f) {
    return function() {
        var args = Array.from(arguments);
        return new Promise((accept, reject) => {
            var handler = function(data) {
                if (data.err) {
                    reject(data.err);
                } else {
                    accept(data);
                }
            }
            args.push(handler);
            f.apply(b, args);
        });
    };
};

var io = {
    // Digital values
    HIGH: b.HIGH,
    LOW: b.LOW,

    // Digital interrupt modes
    RISING: b.RISING,
    FALLING: b.FALLING,
    CHANGE: b.CHANGE,

    // GPIO settings
    INPUT: b.INPUT,
    OUTPUT: b.OUTPUT,

    pinMode: _promisify((pin, mode, callback) => b.pinMode(pin, mode, undefined, undefined, undefined, callback)),

    digitalWrite: _promisify(b.digitalWrite),

    digitalRead: _promisify(b.digitalRead),

    analogRead: _promisify(b.analogRead),

    analogWrite: _promisify(b.analogWrite),

    attachInterrupt: function(pin, handler, mode, callback) {
        var attached = false;
        return new Promise((accept, reject) => {
            b.attachInterrupt(pin, handler, mode, function(data) {
                if (!attached) {
                    if (data.attached) {
                        attached = true;
                        accept();
                    } else {
                        reject(data.err);
                    }
                } else {
                    callback(data);
                }
            });
        });
    },

    detachInterrupt: _promisify(b.detachInterrupt)
};

module.exports = io;

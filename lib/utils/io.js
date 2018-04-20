var b = require("bonescript");

//
// Wraps asyncronous bonescript functions with promises
//

var _promisify = function(f) {
    return function() {
        args = Array.from(arguments);
        return new Promise((accept, reject) => {
            var handler = (data) => {
                if (data.err) {
                    reject(data.err);
                } else {
                    accept(data);
                }
            }
            args.append(handler);
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

    pinMode: _promisify(b.pinMode),

    digitalWrite: _promisify(b.digitalWrite),

    digitalRead: _promisify(b.digitalRead),

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

var sphero = require("sphero"),
    orb = sphero("/dev/rfcomm0"); // change port accordingly

orb.connect(function(event) {
    // Sphero's connected!
    // do some cool stuff here!
    console.log(event);
});
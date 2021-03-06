/**
 * @type {Blink1|exports|module.exports}
 */
var Blink1 = require('node-blink1');
var http = require("http");

/**
 * Blink
 */
var blink1 = new Blink1();

/**
 * @type {number}
 */
var ledSpeed = 10000;
// var ledSpeed = 480000;

/**
 * @type {number}
 */
var heatmapMax = 35;

/**
 * @type {number}
 */
var currentHumidity = 0;

/**
 * @type {number}
 */
var currentApparentTemp = 0;

/**
 * @type {string}
 */

/**
 * @see http://www.bom.gov.au/products/IDN60801/IDN60801.94768.shtml
 * @type {string}
 */
var weatherApi = "http://www.bom.gov.au/fwo/IDN60801/IDN60801.94768.json";

/**
 * @param value between 0 and 1.
 * @returns {string}
 */
function heatMapColorforValue(value) {

    /**
     * @type {number}
     */
    var h = (1.0 - value) * 240;

    /**
     * @type {{r, g, b}|{r: (number|*), g: (number|*), b: (number|*)}}
     */
    var rgb = hslToRgb(h, 100, 50);

    return {
        red: Number(rgb.r.toString().substring(0, 3)),
        green: Number(rgb.g.toString().substring(0, 3)),
        blue: Number(rgb.b.toString().substring(0, 3))
    };
}

/**
 *
 */
function generateColor() {

    http.get(weatherApi, function (res) {
        var body = '';

        // get chunks of data and add it to body
        res.on('data', function (chunk) {
            body += chunk;
        });

        // on end
        res.on('end', function () {

            if (Boolean(body)) {

                // parse the body
                var weatherResponse = JSON.parse(body);

                currentHumidity = weatherResponse.observations.data[0].rel_hum;
                currentApparentTemp = weatherResponse.observations.data[0].apparent_t;
            } else {
                console.log('response undefined', body);
            }

        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });

    var colorCurrentHum = heatMapColorforValue(currentHumidity / 100);
    var colorApparentTemp = heatMapColorforValue(currentApparentTemp / heatmapMax);

    console.log(colorCurrentHum, colorApparentTemp);

    blink1.fadeToRGB(ledSpeed, colorCurrentHum.red, colorCurrentHum.green, colorCurrentHum.blue, 2);
    blink1.fadeToRGB(ledSpeed, colorApparentTemp.red, colorApparentTemp.green, colorApparentTemp.blue, 1);

    var now = new Date();

    console.log('Current Humidty: ' + currentHumidity + '; Apparent Temp: ' + currentApparentTemp + ' Celsius (°C); ', now);

    setTimeout(generateColor, ledSpeed);
}

generateColor();


/**
 *
 * @param h
 * @param s
 * @param l
 * @returns {{r: (number|*), g: (number|*), b: (number|*)}}
 */
function hslToRgb(h, s, l) {

    var r, g, b, m, c, x;

    if (!isFinite(h)) h = 0;
    if (!isFinite(s)) s = 0;
    if (!isFinite(l)) l = 0;

    h /= 60;
    if (h < 0) h = 6 - (-h % 6);
    h %= 6;

    s = Math.max(0, Math.min(1, s / 100));
    l = Math.max(0, Math.min(1, l / 100));

    c = (1 - Math.abs((2 * l) - 1)) * s;
    x = c * (1 - Math.abs((h % 2) - 1));

    if (h < 1) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 2) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 3) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 4) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 5) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    m = l - c / 2;
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return {r: r, g: g, b: b};

}

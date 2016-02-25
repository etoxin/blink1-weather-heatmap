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
var ledSpeed = 60000;

/**
 * @type {number}
 */
var kelvin = 273.15;

/**
 * @type {number}
 */
var heatmapMax = 35;

/**
 * @type {number}
 */
var currentTemp = 0;

/**
 * @type {string}
 */
var apiKey = '44db6a862fba0b067b1930da0d769e98';

/**
 * @type {string}
 */
var weatherApi = "http://api.openweathermap.org/data/2.5/weather?q=Sydney,Aus&appid=" + apiKey;

/**
 * @type {number}
 */
var red = 0;

/**
 * @type {number}
 */
var green = 0;

/**
 * @type {number}
 */
var blue = 0;

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

    red = Number(rgb.r.toString().substring(0, 3));
    green = Number(rgb.g.toString().substring(0, 3));
    blue = Number(rgb.b.toString().substring(0, 3));
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

                currentTemp = weatherResponse.main.temp - kelvin;
            } else {
                console.log('response undefined', body);
            }

        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });

    heatMapColorforValue(currentTemp / heatmapMax);

    blink1.fadeToRGB(ledSpeed, red, green, blue);

    var now = new Date();

    console.log(currentTemp + ' Celsius (°C) - ', now);

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

// Gates
const h = [[1 / Math.sqrt(2), 0], [1 / Math.sqrt(2), 0], [1 / Math.sqrt(2), 0], [-1 / Math.sqrt(2), 0]];
const x = [[0, 0], [1, 0], [1, 0], [0, 0]];
const y = [[0, 0], [0, -1], [0, 1], [0, 0]];
const z = [[1, 0], [0, 0], [0, 0], [-1, 0]];

function rx(t) {
    return [[Math.cos(t / 2), 0], [0, -Math.sin(t / 2)], [0, -Math.sin(t / 2)], [Math.cos(t / 2), 0]]
}

function ry(t) {
    return [[Math.cos(t / 2), 0], [-Math.sin(t / 2), 0], [Math.sin(t / 2), 0], [Math.cos(t / 2), 0]]
}

function rz(t) {
    return [[0, 0], [0, 0], [0, 0], [0, 0]]
}

function main() {
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.clear()
    const n = 4;
    const charts = sheet.getCharts();
    for (let i = 0; i < charts.length; i++) {
        sheet.removeChart(charts[i]);
    }
    init(n)
    barChart(n)
    buildTribonacci(n)
}

// Initializes quantum state
function init(n) {
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.appendRow([dec2bin(n, 0), 1, 0, '', 1])
    for (let i = 1; i < 2 ** n; i++) {
        sheet.appendRow([dec2bin(n, i), 0, 0, '', 0])
    }
}

// Transformations
function transform(n, target, gate) {
    for (let row = 1; row <= 2 ** n; row++) {
        if (is0InPair(row, target)) {
            var row1 = row + 2 ** (n - target - 1);
            applyGate(row, row1, gate);
        }
    }
}

function cTransform(n, control, target, gate) {
    for (let row = 1; row <= 2 ** n; row++) {
        if (is0InPair(row, target) && has1InPos(row, control)) {
            const row1 = row + 2 ** (n - target - 1);
            applyGate(row, row1, gate);
        }
    }
}

function mCTransform(n, controls, target, gate) {
    for (let row = 1; row <= 2 ** n; row++) {
        if (is0InPair(row, target)) {
            let process = true;
            for (let cPos = 0; cPos < controls.length; cPos++) {
                process = process && has1InPos(row, controls[cPos]);
            }
            if (process) {
                const row1 = row + 2 ** (n - target - 1);
                applyGate(row, row1, gate);
            }
        }
    }
}

// Circuit methods (WIP)
function buildFibonacci(n) {
    for (let i = 0; i < n; i++) {
        transform(n, i, rx(Math.PI / 2))
    }
    for (let j = 1; j < n; j++) {
        cTransform(n, [j - 1], j, rx(-Math.PI / 2))
    }
}

function buildTribonacci(n) {
    for (let i = 0; i < n; i++) {
        transform(n, i, rx(Math.PI / 2))
    }
    for (let j = 2; j < n; j++) {
        mCTransform(n, [j - 1, j - 2], j, rx(-Math.PI / 2))
    }
}

function buildSuperposition(n) {
    for (let num = 0; num < n; num++) {
        transform(n, num, ry(Math.PI / 2))
    }
}

//https://gist.github.com/eyecatchup/9536706 Colors
function HSVtoRGB(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if (s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}


function hexColor(a, b) {
    const val = 100;
    let hue = Math.atan2(b, a) * 180 / Math.PI;
    if (hue < 0) hue += 360
    const sat = Math.sqrt(a ** 2 + b ** 2) * 100;
    const rgb = HSVtoRGB(hue, sat, val);
    return "#" + ((1 << 24) + (Math.floor(rgb[0]) << 16) +
        (Math.floor(rgb[1]) << 8) + Math.floor(rgb[2]))
        .toString(16).slice(1);
}

function setColor(row) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const vals = getAmplitude(row);
    const hex = hexColor(vals[0], vals[1]);
    sheet.getRange(row, 4).setBackground(hex)
}

// Histogram
function barChart(n) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const chartBuilder = sheet.newChart()
        .setChartType(Charts.ChartType.BAR)
        .setPosition(1, 6, 0, 0);
    chartBuilder.addRange(sheet.getRange("E1:E" + 2 ** n))

    chartBuilder.setOption('colors', ["red"])
        .setOption('height', sheet.getRowHeight(50) * 2 ** n - 2)
    sheet.insertChart(chartBuilder.build());
}

// Controls and targets
function is0InPair(row, position) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const val = sheet.getRange(row, 1).getValue();
    return val.charAt(position) === '0'
}

function has1InPos(row, position) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const val = sheet.getRange(row, 1).getValue();
    return val.charAt(position) === '1'
}

// Arithmetic operations for complex numbers
function complexAdd(c1, c2) {
    Logger.log(c1.toString());
    Logger.log(c2.toString());
    const rc = [0, 0];
    for (let num = 0; num < 2; num++) {
        rc[num] = c1[num] + c2[num]
    }
    return rc;
}

function complexMult(c1, c2) {
    const temp = -1 * c1[1] * c2[1];
    const newIm = (c1[1] * c2[0]) + (c2[1] * c1[0]);
    const rc = [0, 0];
    rc[0] = temp + (c1[0] * c2[0])
    rc[1] = newIm
    return rc;
}

// Gate functions
function gate(complex1, complex2, g) {
    const tempComplex1 = complexAdd(complexMult(complex1, g[0]), complexMult(complex2, g[1]));
    const tempComplex2 = complexAdd(complexMult(complex1, g[2]), complexMult(complex2, g[3]));
    return [tempComplex1, tempComplex2]
}

function applyGate(row0, row1, g) {
    const c0 = [getAmplitude(row0)[0], getAmplitude(row0)[1]];
    const c1 = [getAmplitude(row1)[0], getAmplitude(row1)[1]];
    const cArr = gate(c0, c1, g);
    setAmplitude(row0, cArr[0][0], cArr[0][1])
    setColor(row0)
    setAmplitude(row1, cArr[1][0], cArr[1][1])
    setColor(row1)

}

// Utility functions
function setAmplitude(row, a, b) {
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.getRange(row, 2).setValue(a)
    sheet.getRange(row, 3).setValue(b)
    sheet.getRange(row, 5).setValue(a ** 2 + b ** 2);
}

function getAmplitude(row) {
    const sheet = SpreadsheetApp.getActiveSheet();
    return [sheet.getRange(row, 2).getValue(), sheet.getRange(row, 3).getValue()]
}

function dec2bin(n, i) {
    let b = i.toString(2);
    const l = b.length;
    for (let j = 0; j < n - l; j++) {
        b = '0' + b
    }
    return b + "  ->  " + i
}

const join = require('path').join;
const request = require('https').request;
const httpRequest = require('http').request;
const parse = require('url').parse;
const writeFile = require('fs').writeFile;
const readFileSync = require('fs').readFileSync;
const minify = require('uglify-js').minify;

const GFWLIST_FILE_PATH = join(__dirname, '../pac/gfwlist.txt');
const TARGET_URL = 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt';
const LINE_DELIMER = ['\r\n', '\r', '\n'];

let readLineLastContent = null;
let readLineLastIndex = 0;

function clear() {
    readLineLastContent = null;
    readLineLastIndex = 0;
}

function readLine(text, shouldStrip) {
    let startIndex = 0;
    let i = null;
    let delimer = null;

    if (text === readLineLastContent) {
        startIndex = readLineLastIndex;
    } else {
        readLineLastContent = text;
    }

    LINE_DELIMER.forEach((char) => {
        const index = text.indexOf(char, startIndex);

        if (index !== -1 && (i === null || index < i)) {
            i = index;
            delimer = char;
        }
    });

    if (i !== null) {
        readLineLastIndex = i + delimer.length;
        return shouldStrip ? text.slice(startIndex, i) : text.slice(startIndex, readLineLastIndex);
    }

    readLineLastIndex = 0;
    return null;
}

readLine.clear = clear;

function shouldDropLine(line) {
    // NOTE: It's possible that gfwlist has rules that is a too long
    // regexp that may crush proxies like 'SwitchySharp' so we would
    // drop these rules here.
    return !line || line[0] === '!' || line[0] === '[' || line.length > 100;
}

function encode(line) {
    return line.replace(/\//g, '\\/');
}

function createListArrayString(text) {
    const list = [];
    let line = readLine(text, true);

    while (line !== null) {
        if (!shouldDropLine(line)) {
            list.push(`"${encode(line)}"`);
        }

        line = readLine(text, true);
    }

    return `var rules = [${list.join(',\n')}];`;
}

function createPACFileContent(text, {localAddr, localPort}) {
    const HOST = `${localAddr}:${localPort}`;
    const userRulesString = readFileSync(join(__dirname, '../pac/user.txt'), {encoding: 'utf8'});
    const rulesString = createListArrayString(`${userRulesString}\n${text}`);
    const SOCKS_STR = `var proxy = "SOCKS5 ${HOST}; SOCKS ${HOST}; DIRECT;";`;
    const matcherString = readFileSync(join(__dirname, '../vendor/ADPMatcher.js'), {encoding: 'utf8'});

    return `${SOCKS_STR}\n${rulesString}\n${matcherString}`;
}

function minifyCode(code) {
    return minify(code, {
        fromString: true
    }).code;
}

exports.getPACFileContent = function (_config) {
    const config = _config || {
            localAddr: '127.0.0.1',
            localPort: '8090',
        };
    const listText = readFileSync(GFWLIST_FILE_PATH, {encoding: 'utf8'});
    return minifyCode(createPACFileContent(listText, config));
}

function requestGFWList(targetURL, next) {
    const options = parse(targetURL);
    const requestMethod = (options.protocol.indexOf('https') >= 0 ? request : httpRequest);

    const req = requestMethod(options, (res) => {
        let data = null;

        res.on('data', (chunk) => {
            data = data ? Buffer.concat([data, chunk]) : chunk;
        });

        res.on('end', () => {
            const listText = Buffer.from(data.toString(), 'base64'); // gfwlist.txt use utf8 encoded content to present base64 content
            next(null, listText);
        });
    });

    req.on('error', (err) => {
        next(err);
    });

    req.end();
}

function updateGFWList() {
    requestGFWList(targetURL, (err, listBuffer) => {
        if (err) {
            throw err;
            return;
        }
        writeFile(GFWLIST_FILE_PATH, listBuffer);
    });
}

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.app = exports.stop = exports.start = undefined;

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _serveStatic = require("serve-static");

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _globalHandlers = require("./routes/global-handlers");

var globalHandler = _interopRequireWildcard(_globalHandlers);

var _allRoutes = require("./routes/all-routes");

var _allRoutes2 = _interopRequireDefault(_allRoutes);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _configLoader = require("./config/config-loader");

var _configLoader2 = _interopRequireDefault(_configLoader);

var _compression = require("compression");

var _compression2 = _interopRequireDefault(_compression);

var _autoVersion = require("./helpers/auto-version");

var _autoVersion2 = _interopRequireDefault(_autoVersion);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let app = (0, _express2.default)();
let log = (0, _debug2.default)("server");
let server;

function start() {
    return new Promise(resolve => {
        server = app.listen(_configLoader2.default.PORT, () => {
            log(`Ready @ localhost:${_configLoader2.default.PORT} -- ${_configLoader2.default.NODE_ENV}`);
            resolve();
        });
    });
}

function stop() {
    return new Promise(resolve => {
        if (server) {
            server.close();
        }

        resolve();
    });
}

// settings
app.set("view engine", "pug");
app.set("views", "./src/resources/views");

// resolve cache busted files
app.locals.autoVersion = _autoVersion2.default;

app.use((0, _compression2.default)());
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

// static files
app.use((0, _serveStatic2.default)("public", { maxAge: _configLoader2.default.NODE_ENV === "production" ? "10 years" : 0 }));

// routes
app.use("/", _allRoutes2.default);

// error handler
app.use(globalHandler.error);

// 404 handler
app.use(globalHandler.notFound);

// get the party started
if (!_configLoader2.default.NODE_ENV.includes("test")) {
    start();
}

exports.start = start;
exports.stop = stop;
exports.app = app;
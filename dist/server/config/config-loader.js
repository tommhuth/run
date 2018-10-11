"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nconf = require("nconf");

var _nconf2 = _interopRequireDefault(_nconf);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaults = JSON.parse(_fs2.default.readFileSync(__dirname + "/default.json"));

_nconf2.default.argv().env().defaults(defaults);

exports.default = _nconf2.default.get();
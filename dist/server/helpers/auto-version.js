"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (file) {
  return `${file}?v=${_package.version}`;
};

var _package = require("../../../package.json");
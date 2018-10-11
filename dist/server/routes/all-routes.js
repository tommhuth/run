"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

const router = (0, _express.Router)();

router.get("/", (req, res) => res.render("app"));

exports.default = router;
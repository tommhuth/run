"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.error = error;
exports.notFound = notFound;
function error(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({
            status: 400,
            message: err.message
        });
    }

    if (err.status === 404) {
        return next();
    }

    let error = _extends({
        message: err.message || "Oops!",
        status: err.status || 500
    }, err);

    res.status(error.status).send(error);
}

function notFound(req, res) {
    res.status(404).end();
}
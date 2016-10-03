"use strict";

let logger = require(`${process.cwd()}/utils/logger`);
// let utils = require(`${process.cwd()}/utils/utils`)
// let model = require('./model');

let Boom = require('boom');

logger.log("Companies Controllers");

exports.get = function(req, res) {
    logger.log("-- GET Ctrl");
    res("GET Ctrl");
};

exports.getOne = function(req, res) {
    logger.log("-- GET ONE Ctrl");
    res("GET Ctrl");
};

exports.post = function(req, res) {
    logger.log("-- POST Ctrl");
    res("POST Ctrl");
};

exports.update = function(req, res) {
    logger.log("-- UPDATE Ctrl");
    res("UPDATE Ctrl");
};

exports.remove = function(req, res) {
    logger.log("-- REMOVE Ctrl");
    res("REMOVE Ctrl");
};
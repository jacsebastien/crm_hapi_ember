"use strict";

let logger  = require(`${process.cwd()}/utils/logger`);
let utils   = require(`${process.cwd()}/utils/utils`);
let Boom    = require('boom');
let model   = require('../model');

let bcrypt  = require('bcrypt');

const saltRounds = 10;

let type = 'company';

exports.get = function(req, res) {
    logger.log("-- GET Companies Ctrl");

    let query = {};
    if(req.query.search){
        let regex = { "$regex": req.query.search, "$options": "i" };
        query = { $or: [
            {'name': regex},
            {'vat.num': regex},
            {'contact.street': regex},
            {'contact.country': regex}
        ]};
    } else if(req.query){
        query = req.query;
    }

    model.find(query).populate('clients bills')
    .then(function(docs){
        let documents = [];
        docs.map(function(documentFromDb){
            let document = {
                type: type,
                id: documentFromDb._id,
                attributes: documentFromDb
            };
            documents.push(document);
        });
        // logger.log({data: documents});
        logger.log("Send companies to view");
        res({data: documents});
    });
};

exports.getOne = function(req, res) {
    logger.log("-- GET ONE Company Ctrl");

    model.findById(req.params.id)
    .populate('clients bills')
    .exec(
        function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            logger.log("Send company to view");
            // logger.log(documentFromDb);
            res(utils.formatJson(type, documentFromDb._id, documentFromDb));
        }
    );
};

exports.post = function(req, res) {
    logger.log("-- POST Company Ctrl");

    let request = {};
    if(req.payload.data)
        request = req.payload.data.attributes;
    let company = new model(request);

    bcrypt.hash(request.login.pwd, saltRounds, function(err, hash) {
        if(err) {
            logger.warn(err.message);
            res(Boom.badRequest(err.message));
            return;
        }
        company.save(function(err, data) {
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            let attributes = {
                message: 'Document saved'
            };
            logger.log(attributes);
            // use a custom function from the utils file to avoid redundancy
            res(utils.formatJson(type, data._id, attributes));
        });
    });
};

exports.update = function(req, res) {
    logger.log("-- UPDATE Company Ctrl");

    let request = {};
    if(req.payload.data)
        request = req.payload.data.attributes;

    // logger.log(request);

    model.findById(req.params.id)
    .exec(
        function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            if(request.login.pwd === documentFromDb.login.pwd) { 
                logger.log("Password don't change");
                model.findByIdAndUpdate(req.params.id, request,
                    function(err, data) {
                        if(err) {
                            logger.warn(err.message);
                            res(Boom.badRequest(err.message));
                            return;
                        }
                        if(data === null){
                            res(Boom.badRequest('This Documents does not exists !'));
                            return;
                        }

                        let attributes = {
                            message: 'Document updated'
                        };
                        logger.log(attributes);
                        res(utils.formatJson(type, data._id, attributes));
                    }
                );
            } else {
                logger.log("New Password");
                bcrypt.hash(request.login.pwd, saltRounds, function(err, hash) {
                    if(err) {
                        logger.warn(err.message);
                        res(Boom.badRequest(err.message));
                        return;
                    }
                    request.login.pwd = hash;
                    // and add it to the db
                    model.findByIdAndUpdate(req.params.id, request,
                        function(err, data) {
                            if(err) {
                                logger.warn(err.message);
                                res(Boom.badRequest(err.message));
                                return;
                            }
                            if(data === null){
                                res(Boom.badRequest('This Documents does not exists !'));
                                return;
                            }

                            let attributes = {
                                message: 'Document updated with new password'
                            };
                            logger.log(attributes);
                            res(utils.formatJson(type, data._id, attributes));
                        }
                    );
                });
            }
        }
    );
};

exports.remove = function(req, res) {
    logger.log("-- REMOVE Company Ctrl");
    
    model.findByIdAndRemove(req.params.id, 
        function(err, data) {
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            let attributes = {
                message: 'Document deleted'
            };
            logger.log(attributes);
            res(utils.formatJson(type, data._id, attributes));
        }
    );
};
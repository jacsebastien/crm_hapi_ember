"use strict";

let logger  = require(`${process.cwd()}/utils/logger`);
let utils   = require(`${process.cwd()}/utils/utils`);
let Boom    = require('boom');

let model   = require('../model');
let companyModel = model;
model = model.Client;

let type = 'client';

exports.get = function(req, res) {
    logger.log("-- GET Clients Ctrl");

    let query = {};
    if(req.query.search){
        logger.log(req.query.search);
        let regex = { "$regex": req.query.search, "$options": "i" };
        query = { $or: [
            {'name': regex},
            {'vat.num': regex}
        ]};
    } else if(req.query){
        query = req.query;
    }

    model.find(query).populate('bills')
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
        logger.log("Send clients to view");
        res({data: documents});
    });
};

exports.getOne = function(req, res) {
    logger.log("-- GET ONE Client Ctrl");

    model.findById(req.params.id)
    .populate('bills')
    .exec(function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            logger.log("Send client to view");
            res(utils.formatJson(type, documentFromDb._id, documentFromDb));
        }
    );
};

exports.post = function(req, res) {
    logger.log("-- POST Client Ctrl");

    let request = {};
    if(req.payload.data)
        request = req.payload.data.attributes;
    let newModel = new model(request);

    newModel.save(function(err, data) {
        if(err) {
            logger.warn(err);
            res(Boom.badRequest(err.message));
            return;
        }
        logger.log("Save Client");
        // get the company corresponding to the id added to the bill
        companyModel.findById(request.company,
            function(err, companyFromDb){
                if(err) {
                    logger.warn(err.message);
                    res(Boom.badRequest(err.message));
                    return;
                }
                logger.log("Get corresponding Company");
                // add the bill id to the company
                companyFromDb.clients.push(newModel._id);
                // update company with new value
                companyModel.findByIdAndUpdate(request.company, companyFromDb,
                    function(err, data) {
                        if(err) {
                            logger.warn(err);
                            res(Boom.badRequest(err.message));
                            return;
                        }
                        let attributes = {
                            message: 'Document saved'
                        };
                        logger.log("Update Company");
                        // use a custom function from the utils file to avoid redundancy
                        res(utils.formatJson(type, data._id, attributes));
                    }
                );
            }
        );
    });
};

exports.update = function(req, res) {
    logger.log("-- UPDATE Client Ctrl");

    let request = {};
    if(req.payload.data)
        request = req.payload.data.attributes;

    logger.log(request);
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
};

exports.remove = function(req, res) {
    logger.log("-- REMOVE Client Ctrl");
    
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
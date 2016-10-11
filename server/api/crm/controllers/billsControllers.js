"use strict";

let logger = require(`${process.cwd()}/utils/logger`);
let utils = require(`${process.cwd()}/utils/utils`)
let model = require('../model');
let companyModel = model;
model = model.Bill;

let Boom = require('boom');

let type = 'bill';

exports.get = function(req, res) {
    logger.log("-- GET Ctrl");

    let query = {};
    if(req.query.search){
        let regex = { "$regex": req.query.search, "$options": "i" };
        query = { $or: [
            {'number': regex}
        ]};
    }

    model.find(query).populate('client company')
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
        logger.log({data: documents});
        res({data: documents});
    });
};

exports.getOne = function(req, res) {
    logger.log("-- GET ONE Ctrl");

    model.findById(req.params.id)
    .populate('client company')
    .exec(function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            logger.log(documentFromDb);
            res(utils.formatJson(type, documentFromDb._id, documentFromDb));
        }
    );
};

exports.post = function(req, res) {
    logger.log("-- POST Ctrl");

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
        logger.log(data);
        // get the company corresponding to the id added to the bill
        companyModel.findById(request.company,
            function(err, companyFromDb){
                if(err) {
                    logger.warn(err.message);
                    res(Boom.badRequest(err.message));
                    return;
                }
                // add the bill id to the company
                companyFromDb.bills.push(newModel._id);
                // update company with new value
                companyModel.findByIdAndUpdate(request.company, companyFromDb,
                    function(err, data) {
                        if(err) {
                            logger.warn(err.message);
                            res(Boom.badRequest(err.message));
                            return;
                        }
                        let attributes = {
                            message: 'Document saved'
                        };
                        
                        // use a custom function from the utils file to avoid redundancy
                        res(utils.formatJson(type, data._id, attributes));
                    }
                );
            }
        );
    });
};

exports.update = function(req, res) {
    logger.log("-- UPDATE Ctrl");

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
            logger.log(data);
            res(utils.formatJson(type, data._id, attributes));
        }
    );
};

exports.remove = function(req, res) {
    logger.log("-- REMOVE Ctrl");
    
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
            logger.log(data);
            res(utils.formatJson(type, data._id, attributes));
        }
    );
};
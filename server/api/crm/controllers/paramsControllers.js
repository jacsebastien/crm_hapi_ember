"use strict";

let logger  = require(`${process.cwd()}/utils/logger`);
let utils   = require(`${process.cwd()}/utils/utils`);
let Boom    = require('boom');
let model   = require('../model');
model = model.Param;

let type = 'param';

exports.get = function(req, res) {
    logger.log("-- GET Params Ctrl");

    model.find()
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
        logger.log("Send params to view");
        res({data: documents});
    });
};

exports.getOne = function(req, res) {
    logger.log("-- GET ONE Param Ctrl");

    model.findById(req.params.id,
        function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            logger.log("Send param to view");
            res(utils.formatJson(type, documentFromDb._id, documentFromDb));
        }
    );
};

exports.post = function(req, res) {
    logger.log("-- POST Param Ctrl");

    let request = {};
    if(req.payload.data)
        request = req.payload.data.attributes;
    let newModel = new model(request);

    newModel.save(function(err, data) {
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
};

exports.update = function(req, res) {
    logger.log("-- UPDATE Param Ctrl");

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
    logger.log("-- REMOVE Param Ctrl");
    
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
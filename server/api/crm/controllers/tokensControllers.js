"use strict";

let Boom    = require('boom');
let _       = require('lodash');
let logger  = require(`${process.cwd()}/utils/logger`);
let jwt     = require('jsonwebtoken');
let model   = require('../model');
let bcrypt  = require('bcrypt');

const saltRounds = 10;

exports.post = function(req, res) {
    logger.log("-- POST token");

    // logger.log(req.payload);
    let request = req.payload;
    let error = new Error('invalid_grant');

	model.find({'login.email': request.email})
	.then(function(docs) {
        // if no result found
        if(!docs.length){
            logger.log("document not found");
            res(Boom.wrap(error, 400));
        } else {
            logger.log("docs found");
            docs.map(function(documentFromDb){
                bcrypt.compare(request.pwd, documentFromDb.login.pwd, function(err, check) { 
                    if(err){
                        logger.warn(err);
                        res(Boom.badImplementation(err))  ;
                        return;
                    }
                    if(check) {
                        logger.log("password match");
                        var token = jwt.sign({ login: req.payload }, 'triptyk', {
                            expiresIn: '24h'
                        });
                        res({
                            "access_token": token,
                            "account_id": documentFromDb._id
                        });
                    } else {
                        logger.warn("wrong password");
                        res(Boom.wrap(error, 400));
                    }
                });
            });
        }
    });
	
};

exports.postVerify = function(req, res) {
	logger.log("-- POST verify password");

    let request = req.payload;
    let error = new Error('invalid_grant');
    logger.log(request);
	model.findById(request.id)
    .exec(function(err, documentFromDb){
            if(err) {
                logger.warn(err.message);
                res(Boom.badRequest(err.message));
                return;
            }
            bcrypt.compare(request.pwd, documentFromDb.login.pwd, function(err, check) { 
                if(err){
                    logger.warn(err);
                    res(Boom.badImplementation(err))  ;
                    return;
                }
                if(check) {
                    logger.log("password match");
                    res({
                        "verify": check
                    });
                } else {
                    logger.warn("wrong password");
                    res(Boom.wrap(error, 400));
                }
            });
        }
    );
};

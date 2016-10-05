"use strict";

let logger = require('./logger');

// let formatJson = function(type, id, attributes) {
//     return `{ "data": {"type": "${type}","id": "${id}","attributes": ${JSON.stringify(attributes)}}}`
// };

module.exports = {
    formatJson : function(type, id, attributes) {
        return `{ "data": {"type": "${type}","id": "${id}","attributes": ${JSON.stringify(attributes)}}}`
    },
    getDocuments: function(model, query, type){
        return model.find(query).populate('clients')
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
            return {data: documents};
        });
    },
    getOne : function(model, id, type) {
        return model.findById(id,
            function(err, documentFromDb){
                if(err) {
                    logger.warn(err.message);
                    return Boom.badRequest(err.message);
                }
                logger.log(documentFromDb);
                return formatJson(type, documentFromDb._id, documentFromDb);
            }
        );
    }
}
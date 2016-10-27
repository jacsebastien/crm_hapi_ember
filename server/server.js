"use strict";

let Hapi    = require('hapi');
let config  = require(`${process.cwd()}/config/config`);
let logger  = require(`${process.cwd()}/utils/logger`);
let db      = require(`${process.cwd()}/utils/db`);
let routes  = require(`${process.cwd()}/api/crm/routes`);

let server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: config.port,
    routes: {
        cors: true
    }
});

db.config();

if(config.seed) {
    require(`${process.cwd()}/utils/seed`);
}

server.register({
    register: require('@gar/hapi-json-api'),
    options: {}
}, (err) => {
    if(err) {
        logger.warn(err);
    }
    server.register(require('inert'), function(err){
        if (err) {
            logger.warn(err);
        }
        // add routes which depends to inert inside the callback to be sure that inert is fully loaded before using it
        // logger.log(__dirname);
        //  fsPath.find('../public', function(err, list){
        //     logger.log(list);
        // });
        // get acces to the public static folder [images, css,...]
        server.route({
            method: 'GET',
            path: '/public/{param*}',
            handler: {
                directory: {
                    path: '../crm-api/public',
                    listing: true
                }
            }
        });

        server.route(routes.endpoints);
    });
});

server.start(() => {
    logger.log(`Server running at: ${server.info.uri}`);
});

module.exports = server;
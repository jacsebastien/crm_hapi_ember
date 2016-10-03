"use strict";

let Hapi = require('hapi');

let config = require(`${process.cwd()}/config/config`);
let logger = require(`${process.cwd()}/utils/logger`);
let db = require(`${process.cwd()}/utils/db`);

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
    server.route(require(`${process.cwd()}/api/crm/routes`));
});

server.start(() => {
    logger.log(`Server running at: ${server.info.uri}`);
});

module.exports = server;
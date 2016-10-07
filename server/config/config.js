'use strict';

let config = {
    logging: true,
    seed: true,
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_DEV || 'development',
}

module.exports = config;
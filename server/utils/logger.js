'use strict';

require('colors');
const config = require('../config/config');
const _ = require('lodash');

let noop = function() {};

let consoleLog = config.logging ? console.log.bind(console) : noop;

let logger = {
    log: function() {
        let tag = '[LOG]'.green;
        let args = _.toArray(arguments)
            .map(function(arg){
                if(typeof arg === 'object'){
                    let str = JSON.stringify(arg);
                    return `${tag} ${str.cyan}`;
                } else {
                    if(arg === undefined){
                        let str = 'undefined';
                        return `${tag} ${str.cyan}`;
                    } else{
                        return `${tag} ${arg.cyan}`;
                    }
                }
            });
            consoleLog.apply(console, args);
    },
    warn: function() {
        let tag = '[WARN]'.red;
        let args = _.toArray(arguments)
            .map(function(arg){
                if(typeof arg === 'object'){
                    let str = JSON.stringify(arg);
                    return `${tag} ${str.cyan}`;
                } else {
                    if(arg === undefined){
                        let str = 'undefined';
                        return `${tag} ${str.cyan}`;
                    } else{
                        return `${tag} ${arg.cyan}`;
                    }
                }
            });
            consoleLog.apply(console, args);
    }
};

module.exports = logger;
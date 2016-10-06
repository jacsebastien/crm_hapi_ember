"use strict";

let server = require(`${process.cwd()}/server`);
let logger = require(`${process.cwd()}/utils/logger`);

let clientsCtrls = require('./controllers/clientsControllers');
let companiesCtrls = require('./controllers/companiesControllers');
let billsCtrls = require('./controllers/billsControllers');
let paramsCtrls = require('./controllers/paramsControllers');

module.exports = [
    // CLIENTS
        {   // Get all clients or a list in function of the research
            method: 'GET',
            path: '/api/clients',
            handler: clientsCtrls.get
        },{
            method: 'GET',
            path: '/api/clients/{id}',
            handler: clientsCtrls.getOne
        },{
            method: 'POST',
            path: '/api/clients',
            handler: clientsCtrls.post
        },{
            method: 'PATCH',
            path: '/api/clients/{id}',
            handler: clientsCtrls.update
        },{
            method: 'DELETE',
            path: '/api/clients/{id}',
            handler: clientsCtrls.remove
        },
    // COMPANIES
        {
            method: 'GET',
            path: '/api/companies',
            handler: companiesCtrls.get
        },{
            method: 'GET',
            path: '/api/companies/{id}',
            handler: companiesCtrls.getOne
        },{
            method: 'POST',
            path: '/api/companies',
            handler: companiesCtrls.post
        },{
            method: 'PATCH',
            path: '/api/companies/{id}',
            handler: companiesCtrls.update
        },{
            method: 'DELETE',
            path: '/api/companies/{id}',
            handler: companiesCtrls.remove
        },
    // BILLS
        {
            method: 'GET',
            path: '/api/bills',
            handler: billsCtrls.get
        },{
            method: 'GET',
            path: '/api/bills/{id}',
            handler: billsCtrls.getOne
        },{
            method: 'POST',
            path: '/api/bills',
            handler: billsCtrls.post
        },{
            method: 'PATCH',
            path: '/api/bills/{id}',
            handler: billsCtrls.update
        },{
            method: 'DELETE',
            path: '/api/bills/{id}',
            handler: billsCtrls.remove
        },
    // PARAMETERS
        {   // get the marameters of the api for general data
            method: 'GET',
            path: '/api/params',
            handler: paramsCtrls.get
        },{
            method: 'POST',
            path: '/api/params',
            handler: paramsCtrls.post
        },{
            method: 'PATCH',
            path: '/api/params/{id}',
            handler: paramsCtrls.update
        },{
            method: 'DELETE',
            path: '/api/params/{id}',
            handler: paramsCtrls.get
        }
    // MISC
        // Login
        // Upload images
        // Export PDF
];
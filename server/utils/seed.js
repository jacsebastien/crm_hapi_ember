let faker   = require('faker');
let _       = require('lodash');
let Model   = require('../api/crm/model');
let logger  = require('./logger');
let bcrypt  = require('bcrypt');

const saltRounds = 10;

const max_companies = 2;
const max_clients = 20;
const clients_in_company = 5;

let companies = [];
let clients = [];
let params = [{
    "rules" : [
        "Facture payable au grand comptant",
        "Facture payable au comptant"
    ],
    "refunds" : [
        "%",
        "€"
    ],
    "countries" : [
        "Belgique",
        "Pays-Bas",
        "Luxembourg",
        "France",
        "Allemange"
    ],
    "vatrate" : [
        "0",
        "6",
        "21"
    ],
    "vatprefix" : [
        "BE",
        "NL",
        "LU",
        "FR",
        "DE"
    ],
    "types": [
        "Pièce",
        "Heure",
        "Jour",
        "Forfait",
        "Libre"
    ]
}];

// logs to connect to the api from front end
let emails = ["sja@triptyk.eu", "john@doe.com"];
let pass = "pass123";

for(let i = 0;i < max_companies;i++){
    let randomNum = Math.floor((Math.random() * params[0].vatprefix.length-1) + 1);

    let randomCompany = {
        "name" : faker.company.companyName(),
        "login": {
            "email": emails[i],
            "pwd" : bcrypt.hashSync(pass, saltRounds)
        },
        "vat" : {
            "prefix" : params[0].vatprefix[randomNum],
            "num" : `${faker.random.number(9999)}.${faker.random.number(999)}.${faker.random.number(999)}`,
            "siren" : "",
            "rcs" : ""
        },
        "clients": [],
        "contact" : {
            "street" : faker.address.streetName(),
            "number" : faker.random.number(150),
            "box" : "",
            "zip" : faker.address.zipCode(),
            "town" : faker.address.city(),
            "country" : params[0].countries[randomNum],
            "mail" : faker.internet.email().toLowerCase(),
            "phonemain" : faker.phone.phoneNumber(),
            "phonesec" : faker.phone.phoneNumber(),
            "fax" : faker.phone.phoneNumber(),
            "web" : faker.internet.url()
        }, 
        "contactperson" : {
            "civility" : faker.name.prefix(),
            "firstname" : faker.name.firstName(),
            "lastname" : faker.name.lastName(),
            "post" : faker.name.jobTitle(),
            "mail" : faker.internet.email().toLowerCase(),
            "phonemain" : faker.phone.phoneNumber(),
            "phonesec" : faker.phone.phoneNumber()
        },
        "paymentinfo" : {
            "bank" : [
                {
                    "name" : faker.finance.accountName(),
                    "iban" : faker.finance.account(),
                    "bic" : ""
                },{
                    "name" : faker.finance.accountName(),
                    "iban" : faker.finance.account(),
                    "bic" : ""
                }
            ],
            "paypal" : [
                {
                    "name": "Paypal Account",
                    "mail": faker.internet.email().toLowerCase()
                }
            ]
        },
        "logo" : "",
        "billsettings" : {
            // link of the file on the server
            "template" : "",
            // rule for the auto-generated bill number
            "rule" : ""
        },
        // Terms of Sales
        "terms" : faker.lorem.paragraphs(),
        "articles" : [
            {
                "name" : faker.commerce.product(),
                "description" : faker.commerce.productName(),
                "pricetype": "Pièce",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 21
            },{
                "name" : faker.commerce.product(),
                "description" : faker.commerce.productName(),
                "pricetype": "Pièce",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 6
            },{
                "name" : faker.commerce.product(),
                "description" : faker.commerce.productName(),
                "pricetype": "Forfait",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 21
            },{
                "name" : faker.commerce.product(),
                "description" : faker.commerce.productName(),
                "pricetype": "Libre",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 0
            }
        ],
        "createdat" : faker.date.past()
    };

    companies.push(randomCompany);
}

for(let i = 0;i < max_clients;i++){
    randomNum = Math.floor((Math.random() * params[0].vatprefix.length-1) + 1);

    let randomClient = {
        "name" : faker.name.findName(),
        "iscompany" : faker.random.boolean(),
        "vat" : {
            "prefix" : params[0].vatprefix[randomNum],
            "num" : `${faker.random.number(9999)}.${faker.random.number(999)}.${faker.random.number(999)}`,
            "siren" : "",
            "rcs" : ""
        },
        "billinginfo" : {
            "civility" : faker.name.prefix(),
            "firstname" : faker.name.firstName(),
            "lastname" : faker.name.lastName(),
            "street" : faker.address.streetName(),
            "number" : faker.random.number(150),
            "box" : "",
            "zip" : faker.address.zipCode(),
            "town" : faker.address.city(),
            "country" : params[0].countries[randomNum],
            "mail" : faker.internet.email().toLowerCase(),
            "phonemain" : faker.phone.phoneNumber(),
            "phonesec" : faker.phone.phoneNumber(),
            "fax" : faker.phone.phoneNumber()
        },
        "deliveryinfo" : {
            "civility" : faker.name.prefix(),
            "firstname" : faker.name.firstName(),
            "lastname" : faker.name.lastName(),
            "company" : faker.company.companyName(),
            "street" : faker.address.streetName(),
            "number" : faker.random.number(150),
            "box" : "",
            "zip" : faker.address.zipCode(),
            "town" : faker.address.city(),
            "country" : params[0].countries[randomNum]
        }, 
        "contactperson" : {
            "civility" : faker.name.prefix(),
            "firstname" : faker.name.firstName(),
            "lastname" : faker.name.lastName(),
            "post" : faker.name.jobTitle(),
            "mail" : faker.internet.email().toLowerCase(),
            "phonemain" : faker.phone.phoneNumber(),
            "phonesec" : faker.phone.phoneNumber(),
        },
        "picture" : "",
        "memo" : faker.lorem.sentence(),
        "createdat" : faker.date.past()
    };
    clients.push(randomClient);
}

logger.log('Seeding the DB');

let createDoc = function(model, doc) {
    return new Promise(function(resolve, reject) {
        new model(doc).save(function(err, saved) {
            return err ? reject(err) : resolve(saved);
        });
    });
};

let cleanDB = function() {
    logger.log('- SEED : Cleaning the DB');
    let cleanPromises = [Model]
        .map(function(model) {
            let remove = model.remove().exec();
            remove.clients = model.Client.remove().exec();
            remove.bills = model.Bill.remove().exec();
            remove.params = model.Param.remove().exec();
            return remove;
        });
    return Promise.all(cleanPromises);
};

let createCompanies = function(data) {
    logger.log("- SEED : Creating Companies");

    let promises = companies.map(function(company) {
        // return createDoc(Model, company);

        let addClientsPromise = new Promise(function(resolve, reject) {
            return Model.Client.find()
            .then(function(docs){
                // logger.log(docs);
                for(let i=0; i< clients_in_company; i++){
                    let random = Math.floor((Math.random() * docs.length-1) + 1);
                    // avoid multiple instances of the same client for one company
                    while(company.clients.indexOf(docs[random]._id) !== -1){
                        random = Math.floor((Math.random() * docs.length-1) + 1);
                    }
                    // logger.log(docs[random]._id);
                    company.clients.push(docs[random]._id);
                }
                return createDoc(Model, company);
            });
        });
        
        return Promise.all(addClientsPromise);
    });

    return Promise.all(promises)
        .then(function(companies) {
            return _.merge({
                companies: companies.length
            }, data || {});
        });
};

let createClients = function(data) {
    logger.log("- SEED : Creating Clients");
    let promises = clients.map(function(client) {
        return createDoc(Model.Client, client);
    });

    return Promise.all(promises)
        .then(function(clients) {
            return _.merge({
                clients: clients.length
            }, data || {});
        });
};

let createParams = function(data) {
    logger.log("- SEED : Creating Parameters");
    let promises = params.map(function(param) {
        return createDoc(Model.Param, param);
    });

    return Promise.all(promises)
        .then(function(params) {
            return _.merge({
                params: params.length
            }, data || {});
        });
};

cleanDB()
    .then(createClients)
    .then(logger.log.bind(logger))
    .catch(logger.log.bind(logger))
    .then(createCompanies)
    .then(logger.log.bind(logger))
    .catch(logger.log.bind(logger))
    .then(createParams)
    .then(logger.log.bind(logger))
    .catch(logger.log.bind(logger));
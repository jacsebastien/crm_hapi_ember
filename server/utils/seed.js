let faker = require('faker');
let _ = require('lodash');
// let bcrypt = require('bcrypt');

let Model = require('../api/crm/model');
let logger = require('./logger');

// const saltRounds = 10;

const maxInputs = 10;

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

for(let i = 0;i < maxInputs;i++){
    let randomCompany = {
        "name" : faker.company.companyName(),
        "login": {
            "email": faker.internet.email(),
            "pwd" : faker.internet.password()
        },
        "vat" : {
            "num" : `${faker.address.countryCode()} ${faker.random.number(9999)}.${faker.random.number(999)}.${faker.random.number(999)}`,
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
            "country" : faker.address.country(),
            "mail" : faker.internet.email(),
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
            "mail" : faker.internet.email(),
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
                    "mail": faker.internet.email()
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
                "pricetype": "Pièce",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 21
            },{
                "name" : faker.commerce.product(),
                "description" : faker.commerce.productName(),
                "pricetype": "Pièce",
                "price" : parseFloat(faker.commerce.price()),
                "vat": 0
            }
        ],
        "createdat" : faker.date.past()
    };

    companies.push(randomCompany);

    let randomClient = {
        "name" : faker.name.findName(),
        "iscompany" : faker.random.boolean(),
        "vat" : {
            "num" : `${faker.address.countryCode()} ${faker.random.number(9999)}.${faker.random.number(999)}.${faker.random.number(999)}`,
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
            "country" : faker.address.country(),
            "mail" : faker.internet.email(),
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
            "country" : faker.address.country()
        }, 
        "contactperson" : {
            "civility" : faker.name.prefix(),
            "firstname" : faker.name.firstName(),
            "lastname" : faker.name.lastName(),
            "post" : faker.name.jobTitle(),
            "mail" : faker.internet.email(),
            "phoneMain" : faker.phone.phoneNumber(),
            "phoneSec" : faker.phone.phoneNumber(),
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
        return createDoc(Model, company);
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
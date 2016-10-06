'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let logger = require(`${process.cwd()}/utils/logger`);
// let validate = require('mongoose-validator');

// place for validators

// -----------


// MODEL
let companyModel = function() {
    let Company = Schema({
        name : {
            type : String,
            required : true
        },
        login: {
            email: {
                type: String,
                required: true
            },
            pwd : {
                type : String,
                required : true
            }
        },
        vat : {
            num : {
                type : String,
                required : true
            },
            siren : String,
            rcs : String
        },
        clients: [{
            // link to the client collection
            type: Schema.Types.ObjectId,
            ref: 'client'
        }],
        contact : {
            street : {
                type : String,
                required : true
            },
            number : {
                type : Number,
                required : true
            },
            box : String,
            zip : {
                type : String,
                required : true
            },
            town : {
                type : String,
                required : true
            },
            country : {
                type : String,
                required : true
            },
            mail : {
                type : String,
                required : true
            },
            phonemain : {
                type : String,
                required : true
            },
            phonesec : String,
            fax : String,
            web : String
        }, 
        contactperson : {
            civility : {
                type : String,
                required : true
            },
            firstname : {
                type : String,
                required : true
            },
            lastname : {
                type : String,
                required : true
            },
            post : String,
            mail : {
                type : String,
                required : true
            },
            phonemain : {
                type : String,
                required : true
            },
            phonesec : String
        },
        paymentinfo : {
            bank : [{
                name : String,
                iban : String,
                bic : String
            }],
            paypal : [{
                name : String,
                mail : String
            }]
        },
        logo : String,
        billsettings : {
            // link of the file on the server
            template : String,
            // rule for the auto-generated bill number
            rule : String
        },
        bills: [{
            type: Schema.Types.ObjectId,
            ref: 'bill'
        }],
        credits: [{
            bill_id: String,
            amount: Number
        }],
        // Terms of Sales
        terms : String,
        articles : [{
            name : String,
            description : String,
            type: String,
            price : Number,
            vat: Number
        }],
        createdat : {
            type : Date,
            required : true
        },
        updatedat : {
            type : Date,
            default : Date.now
        }
    });

    let Bill = Schema({
        // the link of the pdf when printed => if undefined we can edit the bill
        link: String,
        number: String,
        date: Date,
        client: {
            type: Schema.Types.ObjectId,
            ref: 'client'
        },
        project: {
            name: String,
            begin: Date, // date
            end: Date
        },
        details: {
            articles: [{
                name : String,
                description: String,
                type: String,
                quantity: Number,
                price: Number,
                vat: Number,
            }],
            refund: Number,
            // %, €, ...
            refundtype: String,
            // amount already payed by the client
            advance: Number

            // all tots are auto calculated
        },
        deadline: String,
        // can have multiple data type in function of the account type
        primaccount: Schema.Types.Mixed,
        secaccount: Schema.Types.Mixed,

        note: String,
        payedat : Date,
        createdat : Date,
        updatedat: {
            type: Date,
            default: Date.now
        }
    });

    let Client = Schema({
        name : {
            type : String,
            required : true
        },
        iscompany : {
            type : Boolean,
            required : true
        },
        vat : {
            num : String,
            siren : String,
            rcs : String
        },
        billinginfo : {
            civility : String,
            firstname : String,
            lastname : String,
            street : {
                type : String,
                required : true
            },
            number : {
                type : Number,
                required : true
            },
            box : String,
            zip : {
                type : String,
                required : true
            },
            town : {
                type : String,
                required : true
            },
            country : {
                type : String,
                required : true
            },
            mail : {
                type : String,
                required : true
            },
            phonemain : {
                type : String,
                required : true
            },
            phonesec : String,
            fax : String
        },
        deliveryinfo : {
            civility : String,
            firstname : String,
            lastname : String,
            company : String,
            street : {
                type : String,
                required : true
            },
            number : {
                type : Number,
                required : true
            },
            box : String,
            zip : {
                type : String,
                required : true
            },
            town : {
                type : String,
                required : true
            },
            country : {
                type : String,
                required : true
            }
        }, 
        contactperson : {
            civility : {
                type : String,
                required : true
            },
            firstname : {
                type : String,
                required : true
            },
            lastname : {
                type : String,
                required : true
            },
            post : String,
            mail : {
                type : String,
                required : true
            },
            phoneMain : {
                type : String,
                required : true
            },
            phoneSec : String,
        },
        bills: [{
            type: Schema.Types.ObjectId,
            ref: 'bill'
        }],
        picture : String,
        memo : String,
        createdat : {
            type : Date,
            required : true
        },
        updatedat : {
            type : Date,
            default : Date.now
        }
    });

    let Param = Schema({
        rules : [{
            // Payable au grand comptant
            type : String,
            required : true
        }],
        refunds : [{
            // %, €, $, &
            type : String,
            required : true
        }],
        countries : [{
            type : String,
            required : true
        }],
        vatrate : [{
            // 0, 6, 21
            type : Number,
            required : true
        }],
        vatprefix : [{
            // BE, FR, ...
            type : String,
            required : true
        }]
    });

    var Base = mongoose.model('company', Company, 'companies');
    var exports = module.exports = Base;
    Base.Client = mongoose.model('client', Client, 'clients');
    Base.Bill = mongoose.model('bill', Bill, 'bills');
    Base.Param = mongoose.model('param', Param, 'params')
    logger.log(Base);

    return Base;
};
module.exports = new companyModel();
'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let logger = require(`${process.cwd()}/server/utils/logger`);
let validate = require('mongoose-validator');

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
            phoneMain : {
                type : String,
                required : true
            },
            phoneSec : String,
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
            phoneMain : {
                type : String,
                required : true
            },
            phoneSec : String
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

            note: String
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

    let Client = mongoose.Schema({
            name : {
                type : String,
                required : true,
                lowercase : true
            },
            isCompany : {
                type : Boolean,
                required : true
            },
            vat : {
                num : {
                    type : String
                },
                siren : {
                    type : String
                },
                rcs : {
                    type : String
                }
            },
            billingInfo : {
                civility : {
                    type : String
                },
                firstname : {
                    type : String,
                    lowercase : true
                },
                lastname : {
                    type : String,
                    lowercase : true
                },
                street : {
                    type : String,
                    required : true,
                    lowercase: true
                },
                number : {
                    type : Number,
                    required : true,
                    validate : numberValidator
                },
                box : {
                    type : String
                },
                zip : {
                    type : String,
                    required : true
                },
                town : {
                    type : String,
                    required : true,
                    lowercase: true
                },
                country : {
                    type : String,
                    required : true,
                    lowercase: true
                },
                mail : {
                    type : String,
                    required : true,
                    lowercase : true
                },
                phoneMain : {
                    type : String,
                    required : true
                },
                phoneSec : {
                    type : String
                },
                fax : {
                    type : String
                }
            },
            deliveryInfo : {
                civility : {
                    type : String
                },
                firstname : {
                    type : String,
                    lowercase : true
                },
                lastname : {
                    type : String,
                    lowercase : true
                },
                company : {
                    type : String,
                    lowercase : true
                },
                street : {
                    type : String,
                    required : true,
                    lowercase: true
                },
                number : {
                    type : Number,
                    required : true,
                    validate : numberValidator
                },
                box : {
                    type : String
                },
                zip : {
                    type : String,
                    required : true
                },
                town : {
                    type : String,
                    required : true,
                    lowercase: true
                },
                country : {
                    type : String,
                    required : true,
                    lowercase: true
                }
            }, 
            contactPerson : {
                civility : {
                    type : String,
                    required : true
                },
                firstname : {
                    type : String,
                    required : true,
                    lowercase : true
                },
                lastname : {
                    type : String,
                    required : true,
                    lowercase : true
                },
                post : {
                    type : String,
                    lowercase : true
                },
                mail : {
                    type : String,
                    required : true,
                    lowercase : true
                },
                phoneMain : {
                    type : String,
                    required : true
                },
                phoneSec : {
                    type : String
                },
                pwd : {
                    type : String,
                    required : true
                }
            },
            picture : {
                type : String
            },
            bills : [{
                link : {
                    type : String
                },
                state : {
                    type : Boolean
                },
                quotation_id : {
                    type : String,
                    validate : numberValidator
                },
                createdAt : {
                    type : Date,
                    validate : dateValidator
                },
                deadLine : {
                    type : Date,
                    validate : dateValidator
                },
                payedAt : {
                    type : Date,
                    validate : dateValidator
                }
            }],
            quotations : [{
                link : {
                    type : String
                },
                state : {
                    type : Boolean
                },
                createdAt : {
                    type : Date,
                    validate : dateValidator
                }
            }],
            memo : {
                type : String
            },
            createdAt : {
                type : Date,
                required : true,
                validate : dateValidator
            },
            updatedAt : {
                type : Date,
                default : Date.now,
                validate : dateValidator
            }
    });

    let Param = mongoose.Schema({
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
        vatRate : [{
            // 0, 6, 21
            type : Number,
            required : true
        }],
        vatPrefix : [{
            // BE, FR, ...
            type : String,
            required : true,
            uppercase : true
        }]
    });
};
module.exports = new companyModel();
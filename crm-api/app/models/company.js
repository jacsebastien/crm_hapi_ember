import DS from 'ember-data';

export default DS.Model.extend({
    name : DS.attr(),
    login: DS.attr(),
    vat : DS.attr(),
    clients: DS.attr(),
    contact : DS.attr(), 
    contactperson : DS.attr(),
    paymentinfo : DS.attr(),
    logo : DS.attr(),
    billsettings : DS.attr(),
    bills: DS.attr(),
    credits: DS.attr(),
    terms : DS.attr(),
    articles : DS.attr(),
    createdat : DS.attr(),
    updatedat : DS.attr()
});

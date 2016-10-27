import DS from 'ember-data';

export default DS.Model.extend({
    name : DS.attr(),
    iscompany : DS.attr(),
    vat : DS.attr(),
    billinginfo : DS.attr(),
    deliveryinfo : DS.attr(), 
    contactperson : DS.attr(),
    bills : DS.attr(),
    picture : DS.attr(),
    memo : DS.attr(),
    createdat : DS.attr(),
    updatedat : DS.attr(),
    company: DS.attr()
});

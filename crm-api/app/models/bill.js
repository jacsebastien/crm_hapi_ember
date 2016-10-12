import DS from 'ember-data';

export default DS.Model.extend({
    link: DS.attr(),
    iseditable: DS.attr(),
    number: DS.attr(),
    date: DS.attr(),
    client: DS.attr(),
    company: DS.attr(),
    project: DS.attr(),
    details: DS.attr(),
    deadline: DS.attr(),
    primaccount: DS.attr(),
    secaccount: DS.attr(),
    note: DS.attr(),
    payedat : DS.attr(),
    createdat : DS.attr(),
    updatedat: DS.attr()
});

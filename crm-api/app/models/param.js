import DS from 'ember-data';

export default DS.Model.extend({
    rules : DS.attr(),
    refunds : DS.attr(),
    countries : DS.attr(),
    vatrate : DS.attr(),
    vatprefix : DS.attr(),
    types: DS.attr()
});

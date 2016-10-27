import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'table',
    sortedReviews: Ember.computed.sort('clients', 'sortDefinition'),
    sortDefinition: ['name'],
    actions: {
        addClient(clientId) {
            this.sendAction('addClient', clientId);
        }
    }
});

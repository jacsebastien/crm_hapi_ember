import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'table',
    sortedReviews: Ember.computed.sort('bills', 'sortDefinition'),
    sortDefinition: ['createdat:desc'],
    actions: {
        removeBill(bill) {
            this.sendAction('removeBill', bill);
        }
    }
});

import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    
    responseMessage: null,
    errorMessage: null,

    beforeModel: function(transition) {
        this.set('responseMessage', transition.queryParams.responseMessage);
    },
    model() {
        let that = this;
        return this.store.findRecord('company', that.get('session.accountId'), { reload: true });
    }
});

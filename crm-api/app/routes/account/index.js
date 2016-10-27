import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    responseMessage: null,
    beforeModel: function(transition) {
        this.set('responseMessage', transition.queryParams.responseMessage);
    },
    model(){
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            params : this.store.findAll('param')
        });
    },
    setupController(controller, model) {
        this._super(controller, model);
        this.controller.set('devise', "€");

        this.controller.set('company', model.company);
        this.controller.set('params', model.params.objectAt(0));

        this.controller.set('responseMessage', this.responseMessage);
        Ember.run.later(() => this.controller.set('responseMessage', null), 3000);
    }
});

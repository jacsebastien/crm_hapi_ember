import Ember from 'ember';

export default Ember.Route.extend({
    model() {
        return Ember.RSVP.hash({
            company: this.store.findRecord('company', '57f5f0ba6e40a905937fbb00'),
            bill: this.store.createRecord('bill'),
            clients: this.store.findAll('client')
        });
    },
    setupController: function(controller, model) {
        this._super(controller, model);
        controller.set('company', model.company);
        controller.set('newBill', model.bill);
        controller.set('clients', model.clients);
    }
});

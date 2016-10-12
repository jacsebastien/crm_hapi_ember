import Ember from 'ember';

export default Ember.Route.extend({
    model(params){
        return this.store.findRecord('bill', params.bill_id);
    },
    setupController(model, controller){
        let that = this;
        this._super(model, controller);
        this.controller.set('devise', "€");
    }
});

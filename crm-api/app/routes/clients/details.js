import Ember from 'ember';

export default Ember.Route.extend({
    model(params){
        return this.store.findRecord('client', params.client_id);
    },
    setupController(controller, model){
        this._super(controller, model);
        let billinginfo = model.get('billinginfo');
        let deliveryinfo = model.get('deliveryinfo');
        this.controller.set('isSameInfos', false);
        if(billinginfo.street === deliveryinfo.street &&
            billinginfo.number === deliveryinfo.number &&
            billinginfo.zip === deliveryinfo.zip &&
            billinginfo.town === deliveryinfo.town &&
            billinginfo.country === deliveryinfo.country
        ){
            this.controller.set('isSameInfos', true);
        }
    },
    actions: {
        goBack(){
            window.history.back();
        }
    }
});

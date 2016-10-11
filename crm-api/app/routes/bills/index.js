import Ember from 'ember';

export default Ember.Route.extend({
    // local var for the router
    responseMessage: null,
    errorMessage: null,

    beforeModel: function(transition) {
        // get data from other views to manage response Message
        this.set('responseMessage', transition.queryParams.responseMessage);
    },
    
    model(){
        // this.store.query('bills', {search: {"company": "id"}});
        return this.store.findAll('bill');
    },
    setupController(controller, model){
        this._super(controller, model);
        // set the var 'responseMessage' of the controller with data of the var 'responseMessage' from the router
        this.controller.set('responseMessage', this.responseMessage);
        // whait few seconds then hide the message
        Ember.run.later(() => this.controller.set('responseMessage', null), 3000);
    },

    actions: {

    }
});

import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),

    // local var for the router
    responseMessage: null,
    errorMessage: null,

    beforeModel: function(transition) {
        this.set('responseMessage', transition.queryParams.responseMessage);
    },
    
    model(){
        let that = this;
        return this.store.query('bill', {search: that.get('session.accountId')}, { reload: true });
    },
    setupController(controller, model){
        this._super(controller, model);
        // this.controller.set('model', model.sortBy('createdat:asc'));
        // set the var 'responseMessage' of the controller with data of the var 'responseMessage' from the router
        this.controller.set('responseMessage', this.responseMessage);
        // whait few seconds then hide the message
        Ember.run.later(() => this.controller.set('responseMessage', null), 3000);
    },

    actions: {
        removeBill(bill) {
            let that = this;
            if(confirm('Voulez-vous vraiment supprimer cette facture?')) {
                
                let billNumber = bill.get('number');
                let isCredit = bill.get('iscredit');

                bill.destroyRecord()
                .then(()=>{
                    if(isCredit){
                        this.controller.get('model').map(function(correspondingBill){
                            if(correspondingBill.get('number') === billNumber){
                                correspondingBill.set('iscredited', false);

                                correspondingBill.save()
                                .then(()=>{
                                    that.refresh();
                                })
                            }
                        });
                    } else {
                        that.refresh();
                    }
                })
                .catch((response)=>{
                    console.log(response);
                    if(response.errors){
                        if(response.errors[0].status === 400){
                            that.controller.set('error', true);
                            window.scrollTo(0,0);
                        }
                    }
                });
            }
        }
    }
});

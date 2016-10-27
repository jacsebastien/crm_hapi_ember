import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    model(){
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            params : this.store.findAll('param')
        });
    },
    setupController(controller, model){
        this._super(controller, model);
        this.controller.set('company', model.company);
        this.controller.set('clients', model.clients);
        this.controller.set('params', model.params.objectAt(0));

        this.controller.set('client', {});
        this.controller.set('client.company', this.get('session.accountId'));
        this.controller.set('client.vat', {});
        this.controller.set('client.billinginfo', {});
        this.controller.set('client.deliveryinfo', {});
        this.controller.set('client.contactperson', {});
    },
    renderTemplate(){
        this.render('clients/form');
    },
    sameInfos() {
        if(this.controller.get('isSameInfos')){
            // console.log(this.controller.get('client'));
            let billingInfo = this.controller.get('client.billinginfo');
            let deliveryinfo = {
                civility : billingInfo.civility,
                firstname : billingInfo.firstname,
                lastname : billingInfo.lastname,
                company : billingInfo.company,
                street : billingInfo.street,
                number : billingInfo.number,
                box : billingInfo.box,
                zip : billingInfo.zip,
                town : billingInfo.town,
                country : billingInfo.country
            };
            this.controller.set('client.deliveryinfo', deliveryinfo);
        }
    },
    actions : {
        setDeliveryInfo() {
            this.sameInfos();
        },
        saveClient(client){
            let that = this;
            this.sameInfos();
            client.createdat = Date.now();
            // console.log(client);
            let newClient = this.store.createRecord('client', client);
            newClient.save()
            .then(() =>{
                // console.log(response);                    
                this.transitionTo('clients', {queryParams: {responseMessage: 'Nouveau client créé !'}});
            })
            .catch((response)=>{
                newClient.rollbackAttributes();
                // console.log(response);
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        }
    }
});

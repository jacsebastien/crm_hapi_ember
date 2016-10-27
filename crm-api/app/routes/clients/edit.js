import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),

    model(params) {
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            client: this.store.findRecord('client', params.client_id),
            params : this.store.findAll('param')
        });
    },
    setupController(controller, model){
        this._super(controller, model);
        this.controller.set('company', model.company);
        this.controller.set('client', model.client);
        this.controller.set('isSameInfos', false);
        let billinginfo = model.client.get('billinginfo');
        let deliveryinfo = model.client.get('deliveryinfo');
        if(billinginfo.street === deliveryinfo.street &&
            billinginfo.number === deliveryinfo.number &&
            billinginfo.zip === deliveryinfo.zip &&
            billinginfo.town === deliveryinfo.town &&
            billinginfo.country === deliveryinfo.country
        ){
            this.controller.set('isSameInfos', true);
        }

        this.controller.set('params', model.params.objectAt(0));
        this.controller.set('isNew', true);
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
            client.editedat = Date.now();
            client.save()
            .then(() =>{                   
                this.transitionTo('clients', {queryParams: {responseMessage: 'Client mis à jour !'}});
            })
            .catch((response)=>{
                // client.rollbackAttributes();
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        }
    }
});

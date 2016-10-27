import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    save: true,
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

        this.controller.set('newBank', {});
        this.controller.set('newPaypal', {});
    },
    actions : {
        checkChange(){
            this.save = false;
        },
        addBank(newBank){
            if(Ember.isBlank(newBank.name) || Ember.isBlank(newBank.iban)){
                this.controller.set('isBankInvalid', true);
            } else {
                this.controller.set('isBankInvalid', false);
                let tempBank = {
                    name: newBank.name,
                    iban: newBank.iban,
                    bic: newBank.bic
                };
                this.controller.get('company.paymentinfo.bank').pushObject(tempBank);
                this.controller.set('newBank', {});
            }
        },
        deleteBank(bank){
            this.controller.get('company.paymentinfo.bank').removeObject(bank);
        },
        addPaypal(newPaypal){
            if(Ember.isBlank(newPaypal.name) || Ember.isBlank(newPaypal.mail)){
                this.controller.set('isPaypalInvalid', true);
            } else {
                this.controller.set('isPaypalInvalid', false);
                let tempBank = {
                    name: newPaypal.name,
                    mail: newPaypal.mail
                };
                this.controller.get('company.paymentinfo.paypal').pushObject(tempBank);
                this.controller.set('newPaypal', {});
            }
        },
        deletePaypal(paypal){
            this.controller.get('company.paymentinfo.paypal').removeObject(paypal);
        },
        saveAccount(company){
            let that = this;
            company.save()
            .then(()=>{
                this.save = true;
                window.scrollTo(0,0);
                this.transitionTo('account', {queryParams: {responseMessage: 'Comptes enregistrés !'}});
            })
            .catch((response)=>{
                // console.log(response);
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        },
        willTransition(transition){
            if(!this.save){
                if(!confirm("Si vous quitez cette page toutes les modifications seront perdues.\n Voulez-vous continuer?")){
                    transition.abort();
                } else {
                    this.controller.get('company').rollbackAttributes();
                }
            }
        }
    }
});

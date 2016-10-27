import Ember from 'ember';
import moment from 'moment';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    isEdit: false,
    // if we create new articles to add to the DB
    model(params) {
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            bill: this.store.findRecord('bill', params.bill_id),
            params: this.store.findAll('param')
        });
    },
    setupController: function(controller, model) {
        this._super(controller, model);
        let that = this;

        this.controller.set('title', 'Note de crédit');
        this.controller.set('buttonLabel', 'Enregistrer');
        this.controller.set('devise', "€");
        // get the first company of the db
        this.controller.set('company', model.company);
        // we have only one object in the params collection so get the first object of the array
        this.controller.set('params', model.params.objectAt(0));
        this.controller.set('bill', model.bill);

        //if the bill is already a credit we are trying to edit it
        if(this.controller.get('bill.iscredit')){
            this.controller.set('credit', model.bill);
            this.controller.set('credit.creditdate', moment().format('YYYY-MM-DD'));
            this.isEdit =  true;
        } else {
            let credit = {
                iseditable : true,
                iscredit : true,
                iscredited : true,
                number : model.bill.get('number'),
                date : model.bill.get('date'),
                creditdate : moment().format('YYYY-MM-DD'),
                client : model.bill.get('client'),
                company : that.get('session.accountId'),
                project : model.bill.get('project'),
                details : model.bill.get('details'),
                deadline : model.bill.get('deadline'),
                primaccount : model.bill.get('primaccount'),
                secaccount : model.bill.get('secaccount')
            };
            this.isEdit =  false;
            this.controller.set('credit', credit);
            this.controller.set('credit.details.credit', 0);
            this.controller.set('credit.details.totcredit', this.controller.get('credit.details.total'));
        }
        

        this.controller.set('error', false);
    },
    actions : {
        calcCredit(){
            let total = parseFloat(this.controller.get('credit.details.total'));
            let credit = parseFloat(this.controller.get('credit.details.credit'));
            if(isNaN(credit)){
                credit = 0;
            }
            let totcredit = total - credit;
            this.controller.set('credit.details.totcredit', totcredit.toFixed(2));
        },
        saveCredit(newCredit) {
            let that = this;
            
            
            let credit = newCredit;
            // if we edit a credit we don't need to create a new record
            if(this.isEdit){
                credit.updatedat = Date.now();
            } else {
                newCredit.createdat = Date.now();
                credit = this.store.createRecord('bill', newCredit);
            }
            credit.save()
            .then(() =>{
                // if we edit a credit we don't need to edit the corresponding bill
                if(!that.isEdit){
                    this.controller.set('bill.iscredited', true);
                    this.controller.get('bill').save()
                    .then(()=>{
                        this.transitionTo('bills', {queryParams: {responseMessage: 'Crédit enregistré !'}});
                    })
                    .catch((response)=>{
                        if(response.errors[0].status === 400){
                            that.controller.set('error', true);
                            window.scrollTo(0,0);
                        }
                    });
                } else {
                    this.transitionTo('bills', {queryParams: {responseMessage: 'Crédit édité !'}});
                }
            })
            .catch((response)=>{
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        }
    }
});

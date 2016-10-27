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
    setupController(controller, model){
        this._super(controller, model);
        this.controller.set('company', model.company);
        this.controller.set('params', model.params.objectAt(0));
    },
    actions:{
        checkChange(){
            this.save = false;
        },
        saveAccount(company){
            let that = this;
            company.save()
            .then(()=>{       
                this.save = true;
                window.scrollTo(0,0);
                this.transitionTo('account', {queryParams: {responseMessage: 'Changements enregistrés !'}});
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

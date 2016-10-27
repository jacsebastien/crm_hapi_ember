import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    model(){
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            clients : this.store.findAll('client')
        });
    },
    setupController(controller, model){
        this._super(controller, model);
        this.controller.set('company', model.company);
        this.controller.set('clients', model.clients);
    },
    actions : {
        addClient(clientId){
            // console.log(clientId);
            let that = this;
            let verif = false;
            this.controller.get('company.clients').map(function(client){
                if(client._id === clientId){
                    verif = true;
                }
            });
            // console.log(verif);
            if(verif){
                this.controller.set('errorExist', 'Ce client est déjà dans votre répertoire');
                window.scrollTo(0,0);
            } else {
                this.controller.set('errorExist', false);

                this.controller.get('company.clients').push(clientId);
                this.controller.get('company').save()
                .then(() =>{
                    // console.log(response);                    
                    this.transitionTo('clients', {queryParams: {responseMessage: 'Client ajouté !'}});
                })
                .catch((response)=>{
                    // console.log(response);
                    if(response.errors[0].status === 400){
                        that.controller.set('error', true);
                        window.scrollTo(0,0);
                    }
                });
            }
        }
    }
});

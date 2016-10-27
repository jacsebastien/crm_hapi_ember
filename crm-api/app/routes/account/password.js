import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    model(){
        let that = this;
        return this.store.findRecord('company', that.get('session.accountId'));
    },
    setupController(controller, model) {
        this._super(controller, model);

        this.controller.set('company', model);
        // console.log(this.controller.get('company'));

        this.controller.set('password', {});
        this.controller.set('password.oldPass', '');
        this.controller.set('password.newPass', '');
        this.controller.set('password.verify', '');
    },
    actions : {
        savePass(password){
            let that = this;
            console.log(this.controller.get('company'));
            if(this.controller.get('password.newPass').length < 6){
                this.controller.set('isVerifyError', 'Vous devez entrer un mot de passe de au moins 6 carractères');
            } else {
                if(this.controller.get('password.newPass') !== this.controller.get('password.verify')){
                    this.controller.set('isVerifyError', 'Les 2 mots de passe ne correspondent pas');
                } else {
                    this.controller.set('isVerifyError', false);
                }
            }
            
            if(!this.controller.get('isVerifyError')){
                let credentials = {
                    id: that.get('session.accountId'),
                    pwd: password.oldPass
                };

                this.get('session').verify(credentials)
                .then(
                    function() {
                        that.controller.set('isInvalid', false);

                        that.controller.set('company.login.pwd', password.newPass);
                        that.controller.get('company').save()
                        .then(()=>{
                            window.scrollTo(0,0);
                            that.transitionTo('account', {queryParams: {responseMessage: 'Mot de passe changé !'}});
                        }, (reason)=>{
                            console.log(reason);
                            if(reason.errors[0].status === 400){
                                that.controller.set('error', true);
                                window.scrollTo(0,0);
                            }
                        })
                        .catch((reason)=>{
                            console.log(reason);
                            if(reason){
                                that.controller.set('error', true);
                                window.scrollTo(0,0);
                            }
                        });
                    }, 
                    function() {
                        that.controller.set('isInvalid', 'Ancien mot de passe incorrect');
                    }
                );
                
            }
        }
    }
});
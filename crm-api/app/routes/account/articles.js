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

        this.controller.set('newArticle', {});
    },
    actions : {
        checkChange(){
            this.save = false;
        },
        addArticle(newArticle) {
            if(Ember.isBlank(newArticle.name)){
                this.controller.set('isInvalid', true);
            } else {
                this.controller.set('isInvalid', false);
                let tempArticle = {
                    name: newArticle.name,
                    description: newArticle.description,
                    pricetype: newArticle.pricetype,
                    price: newArticle.price,
                    vat: newArticle.vat
                };
                this.controller.get('company.articles').pushObject(tempArticle);
                this.controller.set('newArticle', {});
            }
        },
        deleteArticle(article) {
            this.controller.get('company.articles').removeObject(article);
        },
        saveAccount(company){
            let that = this;
            company.save()
            .then(()=>{
                this.save = true;
                window.scrollTo(0,0);
                this.transitionTo('account', {queryParams: {responseMessage: "Liste d'Articles enregistrée !"}});
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
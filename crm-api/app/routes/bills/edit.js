import Ember from 'ember';
import moment from 'moment';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),

    model(params) {
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId')),
            bill: this.store.findRecord('bill', params.bill_id),
            clients: this.store.findAll('client'),
            params: this.store.findAll('param')
        });
    },
    afterModel(model, transition){
        let clientId = model.bill.get('client._id');
        model.bill.set('client', clientId);
    },
    setupController (controller, model) {
        this._super(controller, model);
        // let that = this;

        this.controller.set('title', 'Editer une facture');
        this.controller.set('buttonLabel', 'Enregistrer');
        this.controller.set('devise', "€");
        this.controller.set('theRoute', this);

        // get the first company of the db
        this.controller.set('company', model.company);
        this.controller.set('clients', model.clients);
        // we have only one object in the params collection so get the first object of the array
        this.controller.set('params', model.params.objectAt(0));

        this.controller.set('bill', model.bill);
        // let clientId = this.controller.get('bill.client._id');
        // this.controller.set('bill.client', clientId);

        // get the bill increment
        let numberSplit = this.controller.get('bill.number').split('-');
        this.controller.set('billIncrement', numberSplit[1]);      

        // console.log(this.controller.get('bill.details'));
        this.controller.set('listArticles', this.controller.get('bill.details.articles'));

        let listAccounts = [];
        this.controller.get('company.paymentinfo.bank').map(function(bank){
            listAccounts.push(bank);
        });
        this.controller.get('company.paymentinfo.paypal').map(function(paypal){
            listAccounts.push(paypal);
        });
        
        this.controller.set('listAccounts', listAccounts);

        this.controller.set('newArticles', []);
        // value to show/hide the "create new article" part of the form
        this.controller.set('isShowForm', false);
        
        this.controller.set('errorNewArticle', false);
        this.controller.set('error', false);

        // values that change in function of the type of the article
        this.controller.set('isQtyDisable', false);
        this.controller.set('isPriceDisable', true);

        // define new void article for the "create new article" part of the form
        this.controller.set('writedArticle', {});
    },
    renderTemplate(){
        this.render('bills/form');
    },
    calculateTots(){
        // CALCULATE REFUND
        let totalxvat = parseFloat(this.get('controller').get('bill.details.totxvat'));
        let refund = parseFloat(this.get('controller').get('bill.details.refund'));
        let utotxvat = parseFloat(this.get('controller').get('bill.details.utotxvat'));
        // console.log(refund);
        if(isNaN(refund)){
            refund = 0;
        }
        if(this.get('controller').get('bill.details.refundtype') === "%"){
            refund = (totalxvat / 100) * refund;
        }
        utotxvat = totalxvat - refund;
        this.get('controller').set('bill.details.utotxvat', utotxvat.toFixed(2));

        // CALCULATE UTOTAL + VAT
        let vat = parseFloat(this.get('controller').get('bill.details.vat'));
        let utotal = parseFloat(this.get('controller').get('bill.details.utotal'));
        utotal = utotxvat + vat;
        this.get('controller').set('bill.details.utotal', utotal.toFixed(2));

        // CALCULATE TOTAL
        let advance = parseFloat(this.get('controller').get('bill.details.advance'));
        let total = parseFloat(this.get('controller').get('bill.details.total'));
        if(isNaN(advance)){
            advance = 0;
        }
        total = utotal - advance;
        this.get('controller').set('bill.details.total', total.toFixed(2));
    },
    newArticle(article, isNew){
        // ADD TO THE TEMP ARRAY
        let tempArticle = {
            name: article.name,
            description: article.description,
            quantity: article.quantity,
            pricetype: article.pricetype,
            price: article.price,
            amount: article.amount,
            vat: article.vat,
            isNew: isNew
        };
        this.controller.get('listArticles').pushObject(tempArticle);
        if(isNew){
            this.controller.get('newArticles').pushObject(tempArticle);
        }

        // CALCULATE
        // totxvat
        let totalxvat = parseFloat(this.controller.get('bill.details.totxvat'));
        totalxvat += parseFloat(article.amount);
        this.controller.set('bill.details.totxvat', totalxvat.toFixed(2));

        // vat
        let vat = parseFloat(this.controller.get('bill.details.vat'));
        let amountvat = (parseFloat(article.amount) / 100) * parseFloat(article.vat);

        vat += parseFloat(amountvat);
        this.controller.set('bill.details.vat', vat.toFixed(2));

        this.calculateTots();
    },
    calcAmount(article){
        let quantity = parseFloat(article.quantity);
        let price = parseFloat(article.price);
        let amount = quantity * price;
        return amount.toFixed(2);
    },
    actions : {
        changeNumber(value){
            // console.log(value);
            this.controller.set('bill.date', value);
            let billnumber = moment(value).format('YYYYMMDD');
            // let billIncrement = this.controller.get('company.bills').length;
            billnumber += "-"+this.controller.get('billIncrement');
            this.controller.set('bill.number', billnumber);
        },
        pickBeginDate(value){
            this.controller.set('bill.project.begin', value);
        },
        pickEndDate(value){
            this.controller.set('bill.project.end', value);
        },
        setArticle() {
            this.controller.set('newArticle.quantity', 1);
            if(this.controller.get('newArticle.pricetype') === "Forfait" || this.controller.get('newArticle.pricetype') === "Libre"){
                this.controller.set('isQtyDisable', true);
                this.controller.set('isPriceDisable', false);
                this.controller.set('newArticle.price', 0);
            } else {
                this.controller.set('isQtyDisable', false);
                this.controller.set('isPriceDisable', true);
            }
            this.controller.set('newArticle.amount', this.calcAmount(this.controller.get('newArticle')));
        },
        showForm(){
            if(this.controller.get('isShowForm') === false){
                this.controller.set('isShowForm', true);
            } else {
                this.controller.set('isShowForm', false);
            }
        },
        typeSet(){
            if(this.controller.get('writedArticle.pricetype') === "Forfait" || this.controller.get('writedArticle.pricetype') === "Libre"){
                this.controller.set('writedArticle.quantity', 1);
                this.controller.set('isWritedQtyDisable', true);
                this.controller.set('isWritedPriceDisable', false);
            } else {
                this.controller.set('isWritedQtyDisable', false);
                this.controller.set('isWritedPriceDisable', true);
            }
            this.controller.set('writedArticle.amount', this.controller.get('writedArticle.price')*this.controller.get('writedArticle.quantity'));
            // console.log(this.controller.get('writedArticle'));
        },
        // loaded when we change the quantity
        calcNewAmount(){
            if(this.controller.get('newArticle.quantity') === undefined){
                this.controller.set('newArticle.quantity', 1);
            }
            this.controller.set('newArticle.amount', this.calcAmount(this.controller.get('newArticle')));
        },
        calcWritedAmount(){
            if(this.controller.get('writedArticle.quantity') === undefined){
                this.controller.set('writedArticle.quantity', 1);
            }
            if(this.controller.get('writedArticle.price') === undefined){
                this.controller.set('writedArticle.price', 0);
            }
            this.controller.set('writedArticle.amount', this.calcAmount(this.controller.get('writedArticle')));
        },
        addArticle(article){
            this.newArticle(article, false);
        },
        createArticle(article){
            // console.log(article);
            if(article.name === undefined || article.description === undefined || article.quantity === undefined || article.price === undefined){
                this.controller.set('errorNewArticle', true);
            } else {
                this.controller.set('errorNewArticle', false);
                // Trick to avoid undefined value when we don't change the value of the dropdown
                if(article.pricetype === undefined){
                    article.pricetype = this.controller.get('params.types.0');
                }
                if(article.vat === undefined){
                    article.vat = this.controller.get('params.vat.0');
                }

                this.newArticle(article, true);            
            }
        },
        deleteArticle(article){
            // console.log(article);
            // delete from the temps array for new items
            if(article.isNew){
                this.controller.get('newArticles').removeObject(article);
            }
            // console.log(this.newArticles);
            // delete from the global temp array
            this.controller.get('listArticles').removeObject(article);
            // console.log(this.controller.get('listArticles'));

            // totxvat
            let totalxvat = parseFloat(this.controller.get('bill.details.totxvat'));
            totalxvat -= parseFloat(article.amount);
            this.controller.set('bill.details.totxvat', totalxvat.toFixed(2));

            // vat
            let vat = parseFloat(this.controller.get('bill.details.vat'));
            let amountvat = (parseFloat(article.amount) / 100) * parseFloat(article.vat);
            // add the vat of the new article to the total
            vat -= parseFloat(amountvat);
            this.controller.set('bill.details.vat', vat.toFixed(2));

            this.calculateTots();
        },
        changeValues(){
            this.calculateTots();
        },
        saveBill(bill) {
            let that = this;

            let refund = parseFloat(bill.details.refund);
            if(isNaN(refund)){
                bill.details.refund = 0;
            }
            // get the list of article to add to the bill
            bill.set('details.articles', that.controller.get('listArticles'));
            console.log(bill);
            bill.updatedat = Date.now();
            // get the list of articles to add to the companie's articles list 
            this.controller.get('newArticles').map(function(article){
                that.controller.get('company.articles').pushObject(article);
            });
            
            // add new articles to articles list of company
            this.controller.get('company').save()
            .then(()=>{
                // console.log(response);
                // add the new bill in bills collection
                bill.save()
                .then(() =>{
                    // console.log(response);                    
                    this.transitionTo('bills', {queryParams: {responseMessage: 'Facture éditée !'}});
                })
                .catch((response)=>{
                    // console.log(response);
                    if(response.errors[0].status === 400){
                        that.controller.set('error', true);
                        window.scrollTo(0,0);
                    }
                });
            })
            .catch((response)=>{
                // console.log(response);
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        },
        willTransition(transition) {
            let model = this.controller.get('model.bill');
            // if the user don't save the form before leaving the page (thx to the Ember Model's hasDirtyAttributes)
            if(model.get('hasDirtyAttributes')) {
                let confirmation = confirm("Vos changements n'ont pas été sauvegardés, voulez-vous changer de page?");

                // if the user say yes
                if(confirmation) {
                    // switch page
                    model.rollbackAttributes();
                } else {
                    // use the parameter passed to the function to stop the transition
                    transition.abort();
                }
            }
        }
    }
});

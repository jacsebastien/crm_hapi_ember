import Ember from 'ember';
import moment from 'moment';

export default Ember.Route.extend({
    // if we create new articles to add to the DB
    newArticles: [],

    model(params) {
        return Ember.RSVP.hash({
            companies: this.store.findAll('company'),
            bill: this.store.findRecord('bill', params.bill_id),
            clients: this.store.findAll('client'),
            params: this.store.findAll('param')
        });
    },
    setupController: function(controller, model) {
        this._super(controller, model);
        let that = this;

        this.controller.set('title', 'Editer une facture');
        this.controller.set('buttonLabel', 'Enregistrer');
        // get the first company of the db
        this.controller.set('company', model.companies.objectAt(0));
        this.controller.set('clients', model.clients);
        // we have only one object in the params collection so get the first object of the array
        this.controller.set('params', model.params.objectAt(0));

        // this.controller.set('bill', model.bill);
        this.controller.set('bill', model.bill);

        let tempDate = moment(this.controller.get('bill.date')).format('YYYY-MM-DD');
        this.controller.set('bill.date', tempDate);

        tempDate = moment(this.controller.get('bill.project.begin')).format('YYYY-MM-DD');
        this.controller.set('bill.project.begin', tempDate);

        tempDate = moment(this.controller.get('bill.project.end')).format('YYYY-MM-DD');
        this.controller.set('bill.project.end', tempDate);

        console.log(this.controller.get('bill.details'));
        this.controller.set('listArticles', this.controller.get('bill.details.articles'));

        this.controller.set('bill.client', this.controller.get('bill.client._id'));

        this.controller.set('newArticles', this.newArticles);
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
        total = utotal - advance;
        this.get('controller').set('bill.details.total', total.toFixed(2));
    },
    newArticle(article, isNew){
        // ADD TO THE TEMP ARRAY
        // create a new objetc to avoid pushing instance of the first inside the tempList and editing it when we edit a new article with the sames properties
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
        // console.log(article);
        this.controller.get('listArticles').pushObject(tempArticle);
        // console.log(this.controller.get('listArticles'));
        if(isNew){
            // add to the temp list of articles prepared to be added to the DB
            this.controller.get('newArticles').pushObject(tempArticle);
            // console.log(this.controller.get('newArticles'));
        }

        // CALCULATE
        // totxvat
        let totalxvat = parseFloat(this.controller.get('bill.details.totxvat'));
        totalxvat += parseFloat(article.amount);
        this.controller.set('bill.details.totxvat', totalxvat.toFixed(2));

        // vat
        let vat = parseFloat(this.controller.get('bill.details.vat'));
        let amountvat = (parseFloat(article.amount) / 100) * parseFloat(article.vat);
        // add the vat of the new article to the total
        vat += parseFloat(amountvat);
        this.controller.set('bill.details.vat', vat.toFixed(2));

        this.calculateTots();
    },
    calcAmount(article){
        let quantity = parseFloat(article.quantity);
        let price = parseFloat(article.price);
        let amount = quantity * price;
        // toFixed(2) to have 2 decimal
        return amount.toFixed(2);
    },
    actions : {
        changeNumber(){
            let billnumber = moment(this.controller.get('bill.date')).format('YYYYMMDD');
            let billIncrement = this.controller.get('company.bills').length;
            billIncrement ++;
            if(billIncrement < 10){
                billIncrement = "00"+billIncrement;
            } else if(billIncrement < 100){
                billIncrement = "0"+billIncrement;
            }
            billnumber += "-"+billIncrement;
            this.controller.set('bill.number', billnumber);
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
            console.log(bill);
            // get the list of article to add to the bill
            bill.details.articles =  this.controller.get('listArticles');
            bill.company =  this.controller.get('company.id');
            // console.log(bill);

            // get the list of articles to add to the companie's articles list 
            this.controller.get('newArticles').map(function(article){
                that.controller.get('company.articles').pushObject(article);
            });
            
            // add new articles to articles list of company
            this.controller.get('company').save()
            .then((response)=>{
                console.log(response);
                // add the new bill in bills collection
                bill.save()
                .then((response) =>{
                    console.log(response);                    
                    this.transitionTo('bills', {queryParams: {responseMessage: 'Nouvelle facture crée !'}});
                })
                .catch((response)=>{
                    bill.rollbackAttributes();
                    console.log(response);
                    if(response.errors[0].status === 400){
                        that.controller.set('error', true);
                        window.scrollTo(0,0);
                    }
                });
            })
            .catch((response)=>{
                console.log(response);
                if(response.errors[0].status === 400){
                    that.controller.set('error', true);
                    window.scrollTo(0,0);
                }
            });
        },
        // willTransition() {
        //     // clean the to delete informations when we leave the page without saving informations
        //     this.controller.get('bill').rollbackAttributes();
        // }
    }
});

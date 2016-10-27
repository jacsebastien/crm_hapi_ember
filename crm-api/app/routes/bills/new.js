import Ember from 'ember';
import moment from 'moment';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    model() {
        let that = this;
        return Ember.RSVP.hash({
            company : this.store.findRecord('company', that.get('session.accountId'), { reload: true }),
            params: this.store.findAll('param')
        });
    },
    setupController: function(controller, model) {
        this._super(controller, model);

        this.controller.set('title', 'Nouvelle facture');
        this.controller.set('buttonLabel', 'Créer');
        this.controller.set('devise', "€");
        this.controller.set('theRoute', this);

        // get the first company of the db
        this.controller.set('company', model.company);
        // this.controller.set('clients', this.controller.get('company.clients'));
        // we have only one object in the params collection so get the first object of the array
        this.controller.set('params', model.params.objectAt(0));

        // this.controller.set('bill', model.bill);
        this.controller.set('bill', {});
        this.controller.set('bill.company', this.get('session.accountId'));
        this.controller.set('bill.iseditable', true);
        this.controller.set('bill.iscredit', false);

        // Define the base values for the bill
        // default date
        let now = moment().format('YYYY-MM-DD');
        this.controller.set('bill.date', now);

        // auto-generated bill number
        let billnumber = moment().format('YYYYMMDD');
        let bills = this.controller.get('company.bills');

        let billIncrement = 0;        
        bills.map(function(bill){
            if(!bill.iscredit){
                billIncrement ++;
            }
        });
        billIncrement ++;
        if(billIncrement < 10){
            billIncrement = "00"+billIncrement;
        } else if(billIncrement < 100){
            billIncrement = "0"+billIncrement;
        }
        // this.controller.set('bill.number', billIncrement);

        billnumber += "-"+billIncrement;
        this.controller.set('billIncrement', billIncrement);

        this.controller.set('bill.number', billnumber);

        // projet 
        this.controller.set('bill.project', {});

        // articles
        this.controller.set('bill.details', {});
        this.controller.set('bill.details.totxvat', 0);
        this.controller.set('bill.details.refund', 0);
        this.controller.set('bill.details.utotxvat', 0);
        this.controller.set('bill.details.vat', 0);
        this.controller.set('bill.details.utotal', 0);
        this.controller.set('bill.details.advance', 0);
        this.controller.set('bill.details.total', 0);

        let listAccounts = [];
        this.controller.get('company.paymentinfo.bank').map(function(bank){
            listAccounts.push(bank);
        });
        this.controller.get('company.paymentinfo.paypal').map(function(paypal){
            listAccounts.push(paypal);
        });
        
        this.controller.set('listAccounts', listAccounts);

        this.controller.set('listArticles', []);
        this.controller.set('newArticles', []);
        // value to show/hide the "create new article" part of the form
        this.controller.set('isShowForm', false);
        
        this.controller.set('errorNewArticle', false);
        this.controller.set('error', false);
        this.controller.set('errorAccount', false);

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
            } else {
                this.controller.set('isWritedQtyDisable', false);
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
                this.controller.set('errorNewArticle', "Vous devez compléter tous les champs");
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
        saveBill(newBill) {
            // console.log(newBill);
            let that = this;
            this.controller.set('error', false);

            if(moment(newBill.date).isAfter(newBill.project.begin)){
                this.controller.set('errorDate', "La date du projet doit être ultérieure à celle de la facture");
                this.controller.set('error', true);
                window.scrollTo(0,0);
            } else {
                this.controller.set('errorDate', false);
            }

            if(moment(newBill.project.begin).isAfter(newBill.project.end)){
                this.controller.set('errorProjectDate', "La date de fin doit être ultérieure à celle de début ");
                this.controller.set('error', true);
                window.scrollTo(0,0);
            } else {
                this.controller.set('errorProjectDate', false);
            }

            if(!newBill.primaccount){
                this.controller.set('errorAccount', "Vous devez sélectionner un compte principal");
                this.controller.set('error', true);
                window.scrollTo(0,0);
            } else {
                this.controller.set('errorAccount', false);
            }

            if(this.controller.get('listArticles').length === 0){
                this.controller.set('errorListArticles', "Vous devez ajouter au moins un article à votre facture");
                this.controller.set('error', true);
                window.scrollTo(0,0);
            } else {
                this.controller.set('errorListArticles', false);
            }
            
            if(!this.controller.get('error')) {
                let refund = parseFloat(newBill.get('details.refund'));
                if(isNaN(refund)){
                    newBill.set('details.refund', 0);
                }
                // get the list of article to add to the newBill
                newBill.details.articles =  this.controller.get('listArticles');
                newBill.createdat = Date.now();
                // get the list of articles to add to the companie's articles list 
                this.controller.get('newArticles').map(function(article){
                    that.controller.get('company.articles').pushObject(article);
                });
                // add new articles to articles list of company
                this.controller.get('company').save()
                .then(()=>{
                    // console.log(response);
                    let bill = this.store.createRecord('bill', newBill);
                    // add the new bill in bills collection
                    bill.save()
                    .then(() =>{
                        // console.log(response);                    
                        this.transitionTo('bills', {queryParams: {responseMessage: 'Nouvelle facture créée !'}});
                    })
                    .catch((response)=>{
                        bill.rollbackAttributes();
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
            }
        }
    }
});

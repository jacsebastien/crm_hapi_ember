import Ember from 'ember';
import moment from 'moment';

export default Ember.Route.extend({
    listArticles : [],
    // if we create new articles to add to the DB
    newArticles: [],

    model() {
        return Ember.RSVP.hash({
            companies: this.store.findAll('company'),
            bill: this.store.createRecord('bill'),
            clients: this.store.findAll('client'),
            params: this.store.findAll('param')
        });
    },
    setupController: function(controller, model) {
        this._super(controller, model);
        // get the first company of the db
        controller.set('company', model.companies.objectAt(0));
        controller.set('clients', model.clients);
        // we have only one object in the params collection so get the first object of the array
        controller.set('params', model.params.objectAt(0));

        controller.set('newBill', model.bill);

        // Define the base values for the bill
        // default date
        let now = moment().format('DD-MM-YYYY');
        controller.set('newBill.date', now);

        // auto-generated bill number
        let billnumber = moment().format('YYYYMMDD');
        let billIncrement = controller.get('company.bills').length;
        billIncrement ++;
        if(billIncrement < 10){
            billIncrement = "00"+billIncrement;
        } else if(billIncrement < 100){
            billIncrement = "0"+billIncrement;
        }
        billnumber += "-"+billIncrement;
        controller.set('newBill.number', billnumber);

        // projet 
        controller.set('newBill.project', {});

        // articles
        controller.set('newBill.details', {});
        controller.set('newBill.details.totxvat', 0);
        controller.set('newBill.details.refund', 0);
        controller.set('newBill.details.utotxvat', 0);
        controller.set('newBill.details.vat', 0);
        controller.set('newBill.details.utotal', 0);
        controller.set('newBill.details.advance', 0);
        controller.set('newBill.details.total', 0);

        controller.set('listArticles', this.listArticles);
        controller.set('newArticles', this.newArticles);
        // value to show/hide the "create new article" part of the form
        controller.set('isShowForm', false);
        
        controller.set('errorNewArticle', false);

        // define new void article for the "create new article" part of the form
        controller.set('writedArticle', {});
    },
    calculateTots(){
        // CALCULATE REFUND
        let totalxvat = parseFloat(this.get('controller').get('newBill.details.totxvat'));
        let refund = parseFloat(this.get('controller').get('newBill.details.refund'));
        let utotxvat = parseFloat(this.get('controller').get('newBill.details.utotxvat'));
        if(this.get('controller').get('newBill.details.refundtype') === "%"){
            refund = (totalxvat / 100) * refund;
        }
        utotxvat = totalxvat - refund;
        this.get('controller').set('newBill.details.utotxvat', utotxvat.toFixed(2));

        // CALCULATE UTOTAL + VAT
        let vat = parseFloat(this.get('controller').get('newBill.details.vat'));
        let utotal = parseFloat(this.get('controller').get('newBill.details.utotal'));
        utotal = utotxvat + vat;
        this.get('controller').set('newBill.details.utotal', utotal.toFixed(2));

        // CALCULATE TOTAL
        let advance = parseFloat(this.get('controller').get('newBill.details.advance'));
        let total = parseFloat(this.get('controller').get('newBill.details.total'));
        total = utotal - advance;
        this.get('controller').set('newBill.details.total', total.toFixed(2));
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
            // clean the inputs
            this.controller.set('writedArticle', {});
        }

        // CALCULATE
        // totxvat
        let totalxvat = parseFloat(this.controller.get('newBill.details.totxvat'));
        totalxvat += parseFloat(article.amount);
        this.controller.set('newBill.details.totxvat', totalxvat.toFixed(2));

        // vat
        let vat = parseFloat(this.controller.get('newBill.details.vat'));
        let amountvat = (parseFloat(article.amount) / 100) * parseFloat(article.vat);
        // add the vat of the new article to the total
        vat += parseFloat(amountvat);
        this.controller.set('newBill.details.vat', vat.toFixed(2));

        this.calculateTots();
    },
    actions : {
        changeNumber(){
            let billnumber = moment(this.controller.get('newBill.date')).format('YYYYMMDD');
            let billIncrement = this.controller.get('company.bills').length;
            billIncrement ++;
            if(billIncrement < 10){
                billIncrement = "00"+billIncrement;
            } else if(billIncrement < 100){
                billIncrement = "0"+billIncrement;
            }
            billnumber += "-"+billIncrement;
            this.controller.set('newBill.number', billnumber);
        },
        setArticle() {
            this.controller.set('newArticle.quantity', 1);
            this.controller.set('newArticle.amount', this.controller.get('newArticle.price'));
        },
        showForm(){
            if(this.controller.get('isShowForm') === false){
                this.controller.set('isShowForm', true);

            } else {
                this.controller.set('isShowForm', false);
            }
        },
        // loaded when we change the quantity
        calcNewAmount(){
            // get the numbers
            let quantity = parseFloat(this.controller.get('newArticle.quantity'));
            let price = parseFloat(this.controller.get('newArticle.price'));
            if(this.controller.get('newArticle.quantity') === ""){
                quantity = 0;
            }

            // calculate
            let amount = quantity * price;

            //affect to the controller
            this.controller.set('newArticle.amount', amount);
        },
        calcWritedAmount(){
            // get the numbers
            let quantity = parseFloat(this.controller.get('writedArticle.quantity'));
            let price = parseFloat(this.controller.get('writedArticle.price'));
            if(this.controller.get('writedArticle.quantity') === ""){
                quantity = 0;
            }
            if(this.controller.get('writedArticle.price') === ""){
                price = 0;
            }

            // calculate
            let amount = quantity * price;

            //affect to the controller
            this.controller.set('writedArticle.amount', amount);
        },
        addArticle(article){
            this.newArticle(article, false);
        },
        createArticle(article){
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
            let totalxvat = parseFloat(this.controller.get('newBill.details.totxvat'));
            totalxvat -= parseFloat(article.amount);
            this.controller.set('newBill.details.totxvat', totalxvat.toFixed(2));

            // vat
            let vat = parseFloat(this.controller.get('newBill.details.vat'));
            let amountvat = (parseFloat(article.amount) / 100) * parseFloat(article.vat);
            // add the vat of the new article to the total
            vat -= parseFloat(amountvat);
            this.controller.set('newBill.details.vat', vat.toFixed(2));

            this.calculateTots();
        },
        changeValues(){
            this.calculateTots();
        },
        saveBill(newBill) {
            // get the list of article to add to the bill
            let billArticles = this.controller.get('listArticles');
            newBill.set('details.articles', billArticles);
            newBill.set('company', this.controller.get('company.id'));
            console.log(newBill);

            // get the list of articles to add to the companie's articles list 
            let newCompanyArticles = this.controller.get('newArticles');
            let companyArticles = this.controller.get('company.articles');
            newCompanyArticles.map(function(article){
                companyArticles.pushObject(article);
            });
            this.controller.set('company.articles', companyArticles);

            // add new articles to articles list of company
            this.controller.get('company').save()
            .then((response)=>{
                console.log(response);
                // add the new bill in bills collection
                newBill.save()
                .then((response) =>{
                    console.log(response);
                }, (response) =>{
                    console.log(response);
                });
            }, (response)=>{
                console.log(response);
            });
        }
    }
});

import Ember from 'ember';

export default Ember.Route.extend({
    listArticles : [],

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
        controller.set('company', model.companies.objectAt(0));
        controller.set('clients', model.clients);
        controller.set('params', model.params.objectAt(0));

        controller.set('newBill', model.bill);
        // Define the base values for the Bill tots
        controller.set('newBill.details', {});
        controller.set('newBill.details.totxvat', 0);
        controller.set('newBill.details.refund', 0);
        controller.set('newBill.details.utotxvat', 0);
        controller.set('newBill.details.vat', 0);
        controller.set('newBill.details.utotal', 0);
        controller.set('newBill.details.advance', 0);
        controller.set('newBill.details.total', 0);

        controller.set('listArticles', this.listArticles);
    },
    actions : {
        setArticle() {
            this.controller.set('newArticle.quantity', 1);
            this.controller.set('newArticle.amount', this.controller.get('newArticle.price'));
        },
        // loaded when we change the quantity
        calcAmount(){
            if(this.controller.get('newArticle.quantity') === ""){
                quantity = 0;
            }
            // get the numbers
            let quantity = parseFloat(this.controller.get('newArticle.quantity'));
            let price = parseFloat(this.controller.get('newArticle.price'));
            
            // calculate
            let amount = quantity * price;

            //affect to the controller
            this.controller.set('newArticle.amount', amount);
        },
        addArticle(newArticle){
            // ADD TO THE TEMP ARRAY
            // create a new objetc to avoid pushing instance of the first inside the tempList and editing it when we edit a new article with the sames properties
            let tempArticle = {
                name: newArticle.name,
                description: newArticle.description,
                quantity: newArticle.quantity,
                pricetype: newArticle.pricetype,
                price: newArticle.price,
                amount: newArticle.amount,
                vat: newArticle.vat
            };
            console.log(newArticle);
            this.controller.get('listArticles').pushObject(tempArticle);

            // CALCULATE TOTALS
            // get numbers
            let totalxvat = parseFloat(this.controller.get('newBill.details.totxvat'));
            let vat = parseFloat(this.controller.get('newBill.details.vat'));
            let articleAmount = parseFloat(newArticle.amount);
            let articleVat = parseFloat(newArticle.vat);

            // calculate
            totalxvat += articleAmount;

            let amountvat = (articleAmount * articleVat)/100;
            console.log(amountvat);

            vat += parseFloat(amountvat);

            //affect
            this.controller.set('newBill.details.totxvat', totalxvat);
            this.controller.set('newBill.details.vat', vat);
        },
        deleteArticle(article){
            let tempList = this.controller.get('listArticles');
            tempList.removeObject(article);
            this.controller.set('listArticles', tempList);

            let totalxvat = parseFloat(this.controller.get('newBill.details.totxvat'));
            totalxvat -= parseFloat(article.amount);
            this.controller.set('newBill.details.totxvat', totalxvat);
        },
        saveBill(newBill) {
            console.log(newBill.get('details'));
        }
    }
});

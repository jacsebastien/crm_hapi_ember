import Ember from 'ember';
import ENV from 'crm-api/config/environment';

export default Ember.Route.extend({
    model(params){
        return this.store.findRecord('bill', params.bill_id);
    },
    setupController(model, controller){
        // let that = this;
        this._super(model, controller);
        this.controller.set('devise', "€");
        this.controller.set('error', false);
        this.controller.set('title', "Détails de la facture");

        if(model.model.get('iscredit')){
            this.controller.set('title', "Détails du crédit");
        }
    },
    actions: {
        printBill(bill) {
            let that = this;

            let folder = "/documents/bills/";
            if(bill.get('iscredit')){
                folder = "/documents/credits/";
            }
            folder += bill.get('client._id');
            // console.log(folder);

            let file = {
                "template" : "/assets/pdfTemplates/body.hbs",
                "folder" : folder,
                "filename" : bill.get('number')
            };

            // create a new object with data from the bill to format them before creating pdf
            let dataForPdf = {
                'number' : bill.get('number'),
                'devise': that.controller.get('devise'),
                'date' : moment(bill.get('date')).format('DD/MM/YYYY'),
                'project' : {
                    'name' : bill.get('project.name'),
                    'begin' : moment(bill.get('project.begin')).format('DD/MM/YYYY'),
                    'end' : moment(bill.get('project.end')).format('DD/MM/YYYY')
                },
                'client' : bill.get('client'),
                'company' : bill.get('company'),
                
                'details' : {
                    "totxvat": bill.get('details.totxvat').toFixed(2),
                    "refund": bill.get('details.refund'),
                    "refundtype": bill.get('details.refundtype'),
                    "utotxvat": bill.get('details.utotxvat').toFixed(2),
                    "vat": bill.get('details.vat').toFixed(2),
                    "utotal": bill.get('details.utotal').toFixed(2),
                    "advance": bill.get('details.advance').toFixed(2),
                    "total": bill.get('details.total').toFixed(2),
                    'credit': bill.get('details.credit') ? bill.get('details.credit').toFixed(2) : null,
                    'totcredit': bill.get('details.totcredit') ? bill.get('details.totcredit').toFixed(2) : null,
                    "articles": []
                },
                'iscredit' : bill.get('iscredit'),
                
                'deadline' : bill.get('deadline'),
                'primaccount' : bill.get('primaccount'),
                'secaccount' : bill.get('secaccount'),
                'note' : bill.get('note'),
                'createdat' : bill.get('createdat'),
                'updatedat' : bill.get('updatedat')
            };

            // format articles then push them into the articles list
            bill.get('details.articles').map(function(article){
                let newArticle = {
                    "name": article.name,
                    "description": article.description,
                    "quantity": article.quantity,
                    "pricetype": article.pricetype,
                    "price": article.price.toFixed(2),
                    "amount": article.amount.toFixed(2),
                    "vat": article.vat
                }
                dataForPdf.details.articles.push(newArticle);
            });

            // console.log(dataForPdf);
            
            return Ember.$.ajax(ENV.apiUrl+'pdf',{
                method: 'POST',
                data: {
                    // need to stringify to keep sub-objects in server side
                    "file" : JSON.stringify(file),
                    "data" : JSON.stringify(dataForPdf)
                },
                success: function(response) {
                    console.log(response);

                    bill.link = folder + "/" + bill.get('number') + ".pdf";
                    bill.iseditable = false;
                    // console.log(bill);
                    bill.save()
                    .then((response) =>{
                        // console.log(response);
                        that.transitionTo('bills', {queryParams: {responseMessage: 'Document imprimé !'}});
                    });
                },
                error: function(reason) {
                    // console.log(reason);
                    that.controller.set('error', "Une erreur s'est produite pendant la sauvegarde du PDF, veuillez réessayer plus tard");
                }
            });
        },
        removeBill(bill) {
            let that = this;
            if(confirm('Voulez-vous vraiment supprimer cette facture?')) {
                
                let billNumber = bill.get('number');
                let isCredit = bill.get('iscredit');

                bill.destroyRecord()
                .then(()=>{
                    if(isCredit){
                        let billsList = that.store.query('bill', {search: that.get('session.accountId')});
                        billsList.map(function(correspondingBill){
                            if(correspondingBill.get('number') === billNumber){
                                correspondingBill.set('iscredited', false);

                                correspondingBill.save()
                                .then(()=>{
                                    that.transitionTo('bills', {queryParams: {responseMessage: 'Facture supprimée !'}});
                                })
                            }
                        });
                    } else {
                        that.refresh();
                    }
                })
                .catch((response)=>{
                    console.log(response);
                    if(response.errors){
                        if(response.errors[0].status === 400){
                            that.controller.set('error', true);
                            window.scrollTo(0,0);
                        }
                    }
                });
            }
        }
    }
});

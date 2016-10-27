import Model from 'ember-data/model';
import attr from 'ember-data/attr';


export default Model.extend({
    '_id': attr(),
    'link': attr(),
    'iseditable': attr(),
    'iscredit': attr(),
    'iscredited': attr(),
    'number': attr(),
    'date': attr(),
    'creditdate': attr(),
    'client': attr(),
    'company': attr(),
    'project': attr(),
    'details': attr(),
    'deadline': attr(),
    'primaccount': attr(),
    'secaccount': attr(),
    'note': attr(),
    'payedat' : attr(),
    'createdat' : attr(),
    'updatedat': attr()
});

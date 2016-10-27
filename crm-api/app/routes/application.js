import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    init() {
        if(localStorage.getItem('accessToken') !== 'null'){
           this.get('session').set('accessToken', localStorage.getItem('accessToken'));
           this.get('session').set('accountId', localStorage.getItem('accountId'));
        }
    }
});

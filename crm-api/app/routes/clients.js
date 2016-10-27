import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    beforeModel(){
        if(!this.get('session.isAuthenticated') || localStorage.getItem('accessToken') === 'null'){
			this.set('session.isAuthenticated', false);
			localStorage.setItem('accessToken', null);
			this.transitionTo('login');	
		}
        // console.log(this.get('session.accountId'));
    }
});

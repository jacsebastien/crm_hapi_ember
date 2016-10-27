import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service('session'),
    beforeModel() {
		if(this.get('session.isAuthenticated') && localStorage.getItem('accessToken') !== 'null'){
			this.transitionTo('index');	
		}
	},
    actions: {
        authenticate () {
            let that = this;
            let credentials = this.controller.getProperties('email', 'pwd');
            
            if(Ember.isBlank(credentials.email)){
				this.controller.set('isInvalid', true);
			} else {
                this.get('session').authenticate(credentials)
                .then(
                    function() {
                        that.controller.set('isInvalid', false);
                        that.controller.set('email', '');
                        that.controller.set('pwd', '');
                    }, 
                    function() {
                        that.controller.set('isInvalid', true);
                        that.controller.set('pwd', '');
                    }
                );
            }
        }
    }
});

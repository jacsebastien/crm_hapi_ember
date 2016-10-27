import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPIAdapter.extend({
    namespace: 'api',
    host: 'http://www.localhost:3000',
    session: Ember.inject.service(),
	headers: Ember.computed('session.accessToken', function() {
		// console.log(this.get("session.accessToken"));
		return {
			"Authorization": `Bearer ${this.get("session.accessToken")}`
		};
	})
});

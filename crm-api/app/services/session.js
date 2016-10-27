import Ember from 'ember';
import ENV from 'crm-api/config/environment';

export default Ember.Service.extend({
    accessToken: null,
    accessError: false,
    accountId: null,
    routing: Ember.inject.service('-routing'),
    session: Ember.inject.service('session'),

    authenticate(credentials) {
        // console.log(credentials);
        let that = this;
        return new Ember.RSVP.Promise(function(resolve, reject) {
            Ember.$.ajax(ENV.oauthUrl, {
                method: "POST",
                data: { 
                    email: credentials.email,
                    pwd: credentials.pwd
                },
                success: function(response) {
                    // console.log('session ok');
                    // console.log(response);
                    localStorage.setItem('accessError', false);
                    that.set('accessToken', response.access_token);
                    that.set('accountId', response.account_id);
                    localStorage.setItem('accessToken', response.access_token);
                    localStorage.setItem('accountId', response.account_id);
                    that.get("routing").transitionTo("index");

                    resolve(response);
                },
                error: function(reason) {
                    // console.log('session error');
                    reject(reason);
                }
            });
        });    
    },

    invalidate() {
        let that = this;
        this.set('accessToken', null);
        this.set('accountId', null);
        localStorage.setItem('accessToken', null);
        localStorage.setItem('accountId', null);
        that.get("routing").transitionTo("login");
    },

    isAuthenticated: Ember.computed('accessToken', function() {
        if(this.get('accessToken') === null || localStorage.getItem('accessToken') === null){
            return false;
        } else {
            return true;
        }
    }),

    verify(credentials) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            Ember.$.ajax(ENV.verifyUrl, {
                method: "POST",
                data: { 
                    id: credentials.id,
                    pwd: credentials.pwd
                },
                success: function(response) {
                    // console.log('verify ok');
                    // console.log(response);

                    resolve(response);
                },
                error: function(reason) {
                    // console.log('verify error');
                    reject(reason);
                }
            });
        });    
    },
});

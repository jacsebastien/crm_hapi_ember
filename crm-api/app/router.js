import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('clients', function() {
    this.route('new');
  });
  this.route('bills', function() {
    this.route('new');
  });
  this.route('account');
});

export default Router;

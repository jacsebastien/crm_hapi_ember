import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('clients', function() {
    this.route('new');
    this.route('details', {path: 'details/:client_id'});
    this.route('edit', {path: 'edit/:client_id'});
    this.route('all');
  });
  this.route('bills', function() {
    this.route('new');
    this.route('details', {path: 'details/:bill_id'});
    this.route('edit', {path: 'edit/:bill_id'});
    this.route('credit', {path: 'credit/:bill_id'});
  });
  this.route('account', function() {
    this.route('edit');
    this.route('billing');
    this.route('articles');
    this.route('password');
  });
  this.route('login');

  this.route('not-found', { path: '/*path' });
});

export default Router;

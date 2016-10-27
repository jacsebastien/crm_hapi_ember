import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'nav',
    classNames: ['main-nav'],
    session: Ember.inject.service('session')
});

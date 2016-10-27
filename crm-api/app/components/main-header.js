import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'header',
    classNames: ['main-header'],
    session: Ember.inject.service('session'),
    actions: {
        invalidateSession() {
            this.get('session').invalidate();
        }
    }
});

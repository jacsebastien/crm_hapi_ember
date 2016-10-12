import Ember from 'ember';

export function formatFloat([value, ...rest]) {

  return value.toFixed(2);
}

export default Ember.Helper.helper(formatFloat);

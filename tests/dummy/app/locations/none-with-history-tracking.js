import Ember from 'ember';

export let history = [];

export default Ember.NoneLocation.extend({
  setURL(path) {
    history.push(path);
    this.set('path', path);
  },

  replaceURL(path) {
    history.splice(history.length -1, 1, path);
    this.set('path', path);
  }
});

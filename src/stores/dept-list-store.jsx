/**
 * Department List Data Store
 */
var Reflux = require('reflux');
var Actions = require('../actions/dept-list-actions');

module.exports = Reflux.createStore({
  listenables: [Actions],

  getItems: function() {
    this.triggerChange();
  },

  setItem: function(item) {
    this.triggerChange();
  },

  removeItem: function() {
    this.triggerChange();
  },

  triggerChange: function() {
    this.trigger('change', this.items);
  }
});

/**
 * Department List Data Store
 */
var Reflux = require('reflux');
var DeptListItemActions = require('../actions/dept-list-item-actions');

module.exports = Reflux.createStore({
  listenables: [DeptListItemActions],

  removeItem: function(item) {
    this.trigger('removeItem', item);
  }

});

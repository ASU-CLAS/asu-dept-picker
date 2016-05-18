/**
 * ASU Department Picker Component
 */
var DeptListItem = require('./dept-list-item');

module.exports = React.createClass({
  render: function() {
    return <ul className="asu-dept-list">
      {this.renderList()}
    </ul>
  },

  renderList: function() {
    return this.props.items.map(function(item) {
      return <DeptListItem onRemoveDept={this.props.onRemoveDept} key={item.id} id={item.id} title={item.title} />
    }.bind(this));
  },
});

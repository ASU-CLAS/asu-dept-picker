/**
 * ASU Department Picker Component
 */
var DeptListItem = require('./dept-list-item');
var DeptStore = require('../stores/dept-list.jsx');
var Actions = require('../actions/dept-list.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      items: this.props.items || []
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({ items: nextProps.items });
  },

  render: function() {
    return <ul className="asu-dept-list">
      {this.renderList()}
    </ul>
  },

  renderList: function() {
    return this.state.items.map(function(item) {
      return <DeptListItem key={item.id} title={item.title} />
    });
  },
});

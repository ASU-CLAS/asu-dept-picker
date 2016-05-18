/**
 * ASU Department List Item Component
 */
var $ = jQuery;

var Reflux = require('reflux');
var Actions = require('../actions/dept-list-item-actions');

module.exports = React.createClass({

  componentDidMount: function() {
    console.log(this);
  },

  getInitialState: function() {
    return {
      id: this.props.id
    }
  },

  handleItemRemove: function(event) {
    Actions.removeItem(this);
  },

  render: function() {
    return <li ref="dept">
      {this.props.title}
      <span className="tag remove">
        <span onClick={this.handleItemRemove} className="fa fa-close"></span>
      </span>
    </li>
  }
});

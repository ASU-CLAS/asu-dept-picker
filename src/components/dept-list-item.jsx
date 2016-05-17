/**
 * ASU Department List Item Component
 */
var $ = jQuery;

module.exports = React.createClass({

  handleItemRemove: function(e) {
    $(window).trigger('dept-list-item.remove', this);
  },

  render: function() {
    return <li ref="dept">
      {this.props.title}
      <span className="tag remove" data-dept-id={this.props.id}>
        <span onClick={this.handleItemRemove} className="fa fa-close"></span>
      </span>
    </li>
  }
});

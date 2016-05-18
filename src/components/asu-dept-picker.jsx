/**
 * ASU Department Picker Component
 */
var $ = jQuery;
var Reflux = require('reflux');
var DeptListStore = require('../stores/dept-list-store');


var DeptTree = require('./dept-tree.jsx');
var DeptList = require('./dept-list.jsx');


module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(DeptListStore, 'onDeptListItemChange')
  ],

  onDeptListItemChange: function(event, item) {
    switch (event) {
      case 'removeItem': this.handleRemoveItem(item);
    }
  },

  getInitialState: function() {
    return {
      config: {items: [], options: {}},
      selectedDepartments: [],
      currentNode: null,
      includeSubdepts: false,
      instance_id: Math.random()
    };
  },

  componentWillMount: function() {
    // Escape support
    $(document).on('keyup', function(e) {
      if (e.keyCode == 27) {
        if ($('.asu-dept-picker-modal').has('dialog-open')) {
          $('.asu-dept-picker-modal').removeClass('dialog-open');
          e.preventDefault();
          return false;
        }
      }
    });
  },

  componentDidMount: function() {
    console.log(this);
  },

  render: function() {
    return <div className="widget-asu-dept-picker">
      {this.renderBrowseButton()}
      {this.renderDepartmentList()}
      {this.renderModal()}
    </div>
  },

  renderModal: function() {
    return <div ref="modal" className="asu-dept-picker-modal">
      <div className="dialog">
        <div className="dialog-title">
          {this.props.title || "Select Department"}
          <div className="close-dialog" onClick={this.handleCancelClick}>
            <span className="fa fa-close"></span>
          </div>
        </div>
        <DeptTree ref="deptTree" {...this.props}
          onTreeClick={this.handleDeptTreeClick}
        />
        <div className="actions">
          <div className="form-item form-type-checkbox">
            <input 
              ref="include_subdept"
              type="checkbox"
              className="form-checkbox"
              onClick={this.handleSubdeptClick}
              defaultChecked={this.state.includeSubdepts ? 'checked' : ''}
            /> 
            <label className="option" onClick={this.handleLabelClick}> Include sub-departments?</label>
            <div className="description" style={{'display': 'none'}}>
              This will include all sub-departments beneath the selected department.
            </div>
          </div>
          <input type="button"
            className="form-submit"
            onClick={this.handleSubmitClick}
            value="Submit"
          />
          <input type="button"
            className="form-submit"
            onClick={this.handleCancelClick}
            value="Cancel"
          />
        </div>
      </div>
    </div>
  },

  renderDepartmentList: function() {
    return <DeptList ref="deptList" items={this.state.selectedDepartments} />
  },

  renderBrowseButton: function() {
    return <div className="browse-button">
      <input type="button"
        value="Browse"
        className="form-submit"
        onClick={this.handleBrowseClick}
      />
    </div>
  },

  handleRemoveItem: function(item) {
    // filter out the item
    console.log('removing item! ' + this.state.instance_id);
  },

  handleSubdeptClick: function() {
    this.setState({ includeSubdepts: !this.state.includeSubdepts });
  },

  handleLabelClick: function() {
    $(this.refs.include_subdept).trigger('click');
  },

  handleCancelClick: function() {
    this.closeModal();
  },

  handleSubmitClick: function() {
    // setup config
    this.setDeptConfig(this.refs.deptTree.state.currentNode);
    // update selected departments list
    this.setSelectedDepartments();
    // close the modal
    this.closeModal();
  },

  handleBrowseClick: function(event) {
    this.openModal();
  },

  handleDeptTreeClick: function(data) {
    this.setState({ currentNode: data.node });
  },

  openModal: function() {
    $(this.refs.modal).addClass('dialog-open');
  },

  closeModal: function() {
    $(this.refs.modal).removeClass('dialog-open');
  },

  setSelectedDepartments: function() {
    var deptTree = this.refs.deptTree;
    var config = this.state.config;
    var depts = [];

    $.each(config.items, function(index, item) {
      depts.push({
        id: item.dept_id,
        title: deptTree.getDeptPath(item.tid)
      });
    });

    this.setState({ selectedDepartments: depts });
  },

  setDeptConfig: function(data) {
    // get the tree path to set the label
    var config = this.state.config;

    var unique = true;
    $.each(config.items, function(index, item) {
      if (item.dept_nid == data.dept_nid) {
        unique = false;
        // update configuration
        config.options[item.dept_id].subdepts = this.state.includeSubdepts;
      }
    }.bind(this));

    if (unique) {
      config.items.push({
        'dept_id': data.dept_id,
        'dept_nid': data.dept_nid,
        'tree_nids': data.tree_nids,
        'tid': data.tid
      });

      config.options[data.dept_id] = {
        subdepts: this.state.includeSubdepts
      };
    }

    this.setState({ config: config });
  }
});

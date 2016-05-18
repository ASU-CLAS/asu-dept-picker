/**
 * ASU Department Picker Component
 */
var DeptTree = require('./dept-tree');
var DeptList = require('./dept-list');
var Modal = require('./modal');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      config: {items: [], options: {}},
      selectedDepartments: [],
      currentNode: null,
      includeSubdepts: false
    };
  },

  render: function() {
    return <div className="widget-asu-dept-picker">
      {this.renderBrowseButton()}
      {this.renderDepartmentList()}
      {this.renderModal()}
    </div>
  },

  renderModal: function() {
    var deptTree = <DeptTree 
      ref="deptTree" {...this.props}
      onTreeClick={this.handleDeptTreeClick}
    />

    return <Modal
      ref="modal"
      title="Select Department"
      content={deptTree}
      onSuccess={this.handleModalSubmit}
      onSubdeptClick={this.handleSubdeptClick}
    />;
  },

  renderDepartmentList: function() {
    return <DeptList
      ref="deptList"
      onRemoveDept={this.handleRemoveDept}
      items={this.state.selectedDepartments}
    />
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

  handleRemoveDept: function(item) {
    console.log('removing item... from state...');
    console.log(item);
  },

  handleSubdeptClick: function() {
    this.setState({ includeSubdepts: !this.state.includeSubdepts });
  },

  handleModalSubmit: function() {
    // setup config
    this.setDeptConfig(this.refs.deptTree.state.currentNode);
    // update selected departments list
    this.setSelectedDepartments();
  },

  handleBrowseClick: function(event) {
    this.refs.modal.show();
  },

  handleDeptTreeClick: function(data) {
    this.setState({ currentNode: data.node });
  },

  setSelectedDepartments: function() {
    var deptTree = this.refs.deptTree;
    var config = this.state.config;
    var depts = [];

    config.items.map(function(item, index){
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
    config.items.map(function(item, index) {
      if (item.dept_nid == data.dept_nid) {
        unique = false;
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

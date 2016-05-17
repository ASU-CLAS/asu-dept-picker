/**
 * @file
 * Javascript for ASU Dept Picker
 *
 * Requires React/ReactDOM
 */
var AsuDeptPicker = require('./components/asu-dept-picker.jsx');

/**
 * Provides an ASU department picker widget.
 */
(function ($) {
  Drupal.behaviors.asu_dept_picker = {
    attach: function(context, settings) {
      // setup any asu-dept-picker fields
      $('.asu-dept-picker:not([data-reactid])', context).each(function() {
        var delta = $(this).attr('data-delta');
        var config = settings.asu_dept_picker[delta];

        // add element to dom
        var asu_dept_picker = React.createElement(AsuDeptPicker, config);
        ReactDOM.render(asu_dept_picker, this);
      });
    }
  }
})(jQuery);

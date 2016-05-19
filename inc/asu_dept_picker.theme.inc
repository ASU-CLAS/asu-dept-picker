<?php

/**
 * Implements hook_theme()
 */
function asu_dept_picker_theme() {
  return array(
    'asu_dept_picker' => array(
      'render element' => 'element',
      'file' => 'inc/asu_dept_picker.theme.inc',
    ),
    'asu_dept_tree' => array(
      'render' => 'element',
      'variables' => array(
        'items' => array(),
        'settings' => array(),
      ),
      'file' => 'inc/asu_dept_picker.theme.inc',
    ),
  );
}

/**
 * Loads required libraries
 */
function _asu_dept_picker_load_libraries() {
  libraries_load('react', 'source');

  // jqTree (http://mbraak.github.com/jqTree)
  libraries_load('jqtree');
  libraries_load('fontawesome');
}

/**
 * Themes an ASU Department Picker
 */
function theme_asu_dept_picker(&$vars) {
  // Load necessary libraries
  _asu_dept_picker_load_libraries();

  // Load javascript and css
  drupal_add_js(drupal_get_path('module', 'asu_dept_picker') . '/asu_dept_picker.react.js');
  drupal_add_js(drupal_get_path('module', 'asu_dept_picker') . '/asu_dept_picker.js');
  drupal_add_css(drupal_get_path('module', 'asu_dept_picker') . '/asu_dept_picker.css');

  // keep a static settings var so we can reference the instance settings in our js
  $settings = &drupal_static(__FUNCTION__, array());
  // keep track of the current instance index
  $index = count($settings);

  // access the form element's info
  $element = $vars['element'];

  // see if we're passing any tree options at all
  if (!isset($element['#asu_dept_tree'])) {
    $element['#asu_dept_tree'] = array();
  }

  // if we don't load any tree json data, use our default one (most common)
  if (!isset($element['#asu_dept_tree']['tree_json_data'])) {
    $element['#asu_dept_tree']['tree_json_data'] = asu_dept_picker_get_tree();
  }

  // store the instance settings for use later
  $settings[$index] = $element['#asu_dept_tree'];

  // add settings to Drupal object
  drupal_add_js(array('asu_dept_picker' => $settings), 'setting');

  $element['#attributes']['data-delta'] = $index;

  $input_element = theme('hidden', $element);

  // return the markup we will use to render our element in our js file
  return '<div class="asu-dept-picker-container">
      <div class="asu-dept-picker" data-delta="'.$index.'"></div>
      ' . $input_element . '
    </div>
  ';
}


/**
 * Themes an ASU Department Tree
 */
function theme_asu_dept_tree(&$vars) {
  // Load necessary libraries
  _asu_dept_picker_load_libraries();

  // Load all tree data
  $tree_json_data = asu_dept_picker_get_tree();

  // Define default top level ids
  $default_top_level_ids = array(
    'top_level_psid' => ASU_DEPT_PICKER_TOP_LEVEL_PS_ID,
    'top_level_nid' => ASU_DEPT_PICKER_TOP_LEVEL_DEPT_NID
  );

  // if (isset($vars['items'][0]['directory_items'])) {
  //   $nids = $vars['items'][0]['directory_items'];
  // }
  // else {
  //   $nids = array(ASU_DEPT_PICKER_TOP_LEVEL_DEPT_NID);
  // }

  $nids = array(ASU_DEPT_PICKER_TOP_LEVEL_DEPT_NID);

  $settings = array(
    'tree_data' => $tree_json_data,
    'top_level_ids' => $top_level_ids,
    'dept_nids'     => $nids,
    // 'standalone'    => $standalone,
  );

  $settings['config_target'] = $config_target;

  $delta = md5(serialize($settings));

  drupal_add_js(array('asu_dept_picker_dept_tree' => $settings), 'setting');

  return '<div class="asu-dept-tree" data-delta=""></div>';
}


/**
 * Implements hook_libraries_info
 *
 * Adds the JQtree library
 * Documentation for the library can be found here http://mbraak.github.io/jqTree/
 *
 * @return mixed
 *
 */
function asu_dept_picker_libraries_info() {
  // Expected to be extracted into 'sites/all/libraries/jqtree'.
  $libraries['jqtree'] = array(
    'name' => 'jQTree Library',
    'vendor url' => 'http://mbraak.github.io/jqTree/',
    'download url' => 'https://github.com/mbraak/jqTree/archive/0.22.0.zip',
    'version callback' => 'asu_dept_picker_short_circuit_version',
    'files' => array(
      'js' => array('tree.jquery.js'),
      'css' => array('jqtree.css'),
    ),
  );

  return $libraries;
}


/**
 * Short-circuit the version argument.
 */
function asu_dept_picker_short_circuit_version() {
  return TRUE;
}

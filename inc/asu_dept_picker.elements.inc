<?php


function _asu_dept_picker_elements() {
  return array(
    'asu_dept_picker' => array(
      '#input' => TRUE,
      '#process' => array('_asu_dept_picker_element_process'),
      '#element_validate' => array('_asu_dept_picker_element_validate'),
      '#theme' => array('asu_dept_picker'),
      '#theme_wrappers' => array('form_element'),
    ),
  );
}


function _asu_dept_picker_element_process($element, &$form_state, $complete_form) {
  // #tree = TRUE means that the values in $form_state['values'] will be stored
  // hierarchically. In this case, the parts of the element will appear in
  // $form_state['values'] as
  // $form_state['values']['<element_name>']['areacode'],
  // $form_state['values']['<element_name>']['prefix'],
  // etc. This technique is preferred when an element has member form
  // elements.
  $element['#tree'] = TRUE;

  // dpm($element);

  // // Normal FAPI field definitions, except that #value is defined.
  // $element['areacode'] = array(
  //   '#type' => 'textfield',
  //   '#size' => 3,
  //   '#maxlength' => 3,
  //   '#value' => $element['#value']['areacode'],
  //   '#required' => TRUE,
  //   '#prefix' => '(',
  //   '#suffix' => ')',
  // );
  // $element['prefix'] = array(
  //   '#type' => 'textfield',
  //   '#size' => 3,
  //   '#maxlength' => 3,
  //   '#required' => TRUE,
  //   '#value' => $element['#value']['prefix'],
  // );
  // $element['extension'] = array(
  //   '#type' => 'textfield',
  //   '#size' => 4,
  //   '#maxlength' => 4,
  //   '#value' => $element['#value']['extension'],
  // );

  return $element;
}


function _asu_dept_picker_element_validate($element, &$form_state) {
  if (isset($element['#value']['areacode'])) {
    if (0 == preg_match('/^\d{3}$/', $element['#value']['areacode'])) {
      form_error($element['areacode'], t('The area code is invalid.'));
    }
  }
  if (isset($element['#value']['prefix'])) {
    if (0 == preg_match('/^\d{3}$/', $element['#value']['prefix'])) {
      form_error($element['prefix'], t('The prefix is invalid.'));
    }
  }
  if (isset($element['#value']['extension'])) {
    if (0 == preg_match('/^\d{4}$/', $element['#value']['extension'])) {
      form_error($element['extension'], t('The extension is invalid.'));
    }
  }
  return $element;
}





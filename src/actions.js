const actions = [
  'LOAD_DONE',
  'DO_LAYOUT',
  'LAYOUT_DONE',
  'REDRAW',
  'CLEAR',
  'TOGGLE_CONTROLS',
  'ADD_NODE',
  'REMOVE_ELEMENT',
  'SELECT_ELEMENT',
  'DESELECT_ELEMENT',
  'ADD_EDGE',
  'SET_IN_HANDLE',
  'CLEAR_IN_HANDLE',
  'SET_OUT_HANDLE',
  'CLEAR_OUT_HANDLE',
  'START_CONNECTING',
  'END_CONNECTING',
  'SET_DISRUPTIONS',
  'SET_ELEMENT_ATTRIBUTE',
  'SET_GRAPH_ATTRIBUTE',
  'EXPORT_JSON',
  'EXPORT_PNG',
  'SET_STATE',
  'SET_STATE_NAME'
];

export default actions.reduce((prev, cur) => {
  prev[cur] = cur;
  return prev;
}, {});

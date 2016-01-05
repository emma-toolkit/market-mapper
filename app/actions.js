const actions = [
  'LOAD_NODES',
  'LAYOUT_DONE',
  'TEST'
];

export default actions.reduce(function(prev, cur) {
  prev[cur] = cur;
  return prev;
}, {});

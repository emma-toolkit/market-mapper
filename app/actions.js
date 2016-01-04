const actions = [
  'LOAD_NODES',
  'LAYOUT_DONE'
];

export default actions.reduce(function(prev, cur) {
  prev[cur] = cur;
  return prev;
}, {});

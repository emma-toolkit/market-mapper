const actions = [
  'LOAD_NODES',
  'INIT_NODE',
  'LAYOUT_CHAIN'
];

export default actions.reduce(function(prev, cur) {
  prev[cur] = cur;
  return prev;
}, {});

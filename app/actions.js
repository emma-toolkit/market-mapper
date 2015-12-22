const actions = [
  'LOAD_NODES'
];

export default actions.reduce(function(prev, cur) {
  prev[cur] = cur;
  return prev;
}, {});

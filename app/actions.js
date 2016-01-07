const actions = [
  'LOAD_DONE',
  'LAYOUT_DONE',
  'EXPORT_DONE'
];

export default actions.reduce((prev, cur) => {
  prev[cur] = cur;
  return prev;
}, {});

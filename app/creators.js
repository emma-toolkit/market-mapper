import { createAction } from 'redux-actions'
import actions from './actions'
import data from '../dev/data.json'

const loadNodes = createAction(actions.LOAD_NODES, function() {
  const nodes = {
    environment: {},
    chain: {},
    infrastructure: {}
  };
  for (let id in data) {
    const node = data[id];
    nodes[node.type][id] = node;
  };
  return nodes;
});

export default {
  loadNodes: loadNodes
};

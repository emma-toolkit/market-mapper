import { createAction } from 'redux-actions'
import actions from './actions'
import data from '../dev/data.json'

const loadNodes = createAction(actions.LOAD_NODES, function() {
  const nodes = {
    environment: new Map(),
    chain: new Map(),
    infrastructure: new Map()
  };
  for (let id in data) {
    const node = data[id];
    nodes[node.type].set(id, node);
  };
  return nodes;
});

export default {
  loadNodes: loadNodes
};

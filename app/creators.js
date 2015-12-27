import { createAction } from 'redux-actions'
import { graphlib as GraphLib, layout } from 'dagre'
import store from './store'
import actions from './actions'
import data from '../dev/data.json'

export default {
  loadNodes: createAction(actions.LOAD_NODES, function() {
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
  }),

  initNode: createAction(actions.INIT_NODE, function (id, x, y, w, h) {
    return {id, x, y, w, h};
  }),
  
  layoutChain: createAction(actions.LAYOUT_CHAIN, function() {
    const graph = new GraphLib.Graph();
    graph.setGraph({
      rankdir: 'LR'
    });
    graph.setDefaultEdgeLabel(() => {return {}});
    
    const nodes = new Map();
    store.getState().get('chain').forEach(function(d, id) {
      const node = {
        label: d.get('name'),
        width: d.get('w'),
        height: d.get('h')
      };
      nodes.set(id, node);
      graph.setNode(id, node);
      for (let edge_id of d.get('edges')) graph.setEdge(id, edge_id);
    });
    layout(graph);

    const positions = new Map();
    for (let [id, node] of nodes) positions.set(id, {x: node.x, y: node.y});
    return {positions};
  })
};

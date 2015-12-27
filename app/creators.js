import { createAction } from 'redux-actions'
import { graphlib as GraphLib, layout } from 'dagre'
import store from './store'
import actions from './actions'
import data from '../dev/data.json'

export default {
  loadNodes: createAction(
    actions.LOAD_NODES,
    function() {
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
    }
  ),

  initNode: createAction(
    actions.INIT_NODE,
    function (id, x, y, w, h) {return {id, x, y, w, h}}
  ),
  
  layoutChain: createAction(
    actions.LAYOUT_CHAIN,
    function(container_width, container_height) {
      // Set graph nodes and edges
      const graph = new GraphLib.Graph();
      graph.setDefaultEdgeLabel({});
      store.getState().get('chain').forEach(function(d, id) {
        graph.setNode(id, {
          width: d.get('w'),
          height: d.get('h'),
        });
        for (let edge_id of d.get('edges')) graph.setEdge(id, edge_id);
      });

      // Perform layout without spacing
      graph.setGraph({
        rankdir: 'LR',
        ranksep: 0,
        nodesep: 0
      });
      layout(graph);

      // Compile column data 
      const cols = new Map();
      for (let id of graph.nodes()) {
        const x = graph.node(id).x;
        const count = cols.get(x);
        if (count === undefined) cols.set(x, 1);
        else cols.set(x, count + 1);
      }

      // Perform final layout with spacing
      const graph_data = graph.graph();
      const space = (container_width - graph_data.width) / (cols.size * 2);
      graph.setGraph({
        rankdir: 'LR',
        ranksep: space * 2,
        nodesep: (container_height - graph_data.height) /
          (Math.max(...cols.values()) - 1),
        marginx: space
      });
      layout(graph);

      // Return position payload
      const positions = new Map();
      for (let id of graph.nodes()) {
        const node = graph.node(id);
        positions.set(parseInt(id), {x: node.x, y: node.y});
      }
      return positions;
    }
  )
};

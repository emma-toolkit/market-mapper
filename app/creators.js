import { createAction } from 'redux-actions'
import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import actions from './actions'
import data from '../dev/data.json'
CytoscapeDagre(Cytoscape, Dagre);

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
  
  layoutGraph: createAction(
    actions.LAYOUT_GRAPH,
    function(environment, chain, infrastructure, div) {
      const data = {
        nodes: [],
        edges: []
      };
      addElements('environment', environment, data);
      addElements('chain', chain, data);
      addElements('infrastructure', infrastructure, data);

      const graph = Cytoscape({
        container: div,
        elements: {
          nodes: data.nodes,
          edges: data.edges
        },
        layout: {
          name: 'dagre',
          rankDir: 'TB',
          // boundingBox: {
          //   x1: 0,
          //   y1: 0,
          //   w: div.offsetWidth,
          //   h: div.offsetHeight
          // }
        }
      });
    }
  )
};


function addElements(type, state, data) {
  data.nodes.push({
    group: 'nodes',
    data: {id: type}
  });
  state.forEach(function(d, id) {
    data.nodes.push({
      group: 'nodes',
      data: {
        id,
        parent: type
      }
    });
    for (let edge_id of d.get('edges')) {
      data.edges.push({
        group: 'edges',
        data: {
          id: `[${id},${edge_id}]`,
          source: id,
          target: edge_id
        }
      });
    }
  });
}

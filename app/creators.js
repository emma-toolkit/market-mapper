import { createAction } from 'redux-actions'
import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import actions from './actions'
import graph_style from '../styles/graph.styl'
import data from '../dev/rice.json'
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
    actions.LAYOUT_DONE,
    function(data, div) {
      const margin = div.offsetHeight / 10;
      const one_third = div.offsetHeight / 3;
      
      // Init nodes and edges
      const elements = {
        nodes: [],
        edges: []
      };
      addElements('environment', data, elements);
      addElements('chain', data, elements);
      addElements('infrastructure', data, elements);

      // Create graph and do layout
      const graph = Cytoscape({
        container: div,
        elements: {
          nodes: elements.nodes,
          edges: elements.edges
        },
        layout: {name: 'null'},
        style: graph_style.toString(),
        zoomingEnabled: false,
        panningEnabled: false,
        ready: function(e) {
          // Add classes to chain roots and leaves
          const chain = e.cy.elements('.chain');
          chain.roots().addClass('root');
          chain.leaves().addClass('leaf');

          // Layout chain and infrustructure together
          // in order to determine infrastructure order
          e.cy.elements('.chain, .infrastructure').layout({
            name: 'dagre',
            rankDir: 'LR'
          });
          const infrastructure = e.cy.nodes('.infrastructure').sort(
            (ele1, ele2) => ele1.position().y - ele2.position().y
          );

          // Layout environment
          const environment = e.cy.elements('.environment');
          environment.layout({
            name: 'grid',
            boundingBox: {
              x1: 0,
              y1: 0,
              x2: div.offsetWidth,
              y2: one_third - margin
            }
          });

          // Layout chain
          chain.layout({
            name: 'dagre',
            rankDir: 'LR'
          });
          chain.layout({
            name: 'dagre',
            rankDir: 'LR',
            boundingBox: getBoundingBox(chain, div, {
              top: one_third,
              right: margin,
              bottom: one_third,
              left: margin
            })
          });

          // Layout infrastructure
          infrastructure.layout({
            name: 'grid',
            boundingBox: {
              x1: 0,
              y1: one_third * 2 + margin,
              x2: div.offsetWidth,
              y2: div.offsetHeight
            }
          });
        }
      });
    }
  )
};


function addElements(type, data, elements) {
  elements.nodes.push({
    group: 'nodes',
    data: {id: type},
    classes: 'parent'
  });
  data[type].forEach(function(d, id) {
    elements.nodes.push({
      group: 'nodes',
      data: {
        id,
        parent: type,
        label: d.get('name')
      },
      classes: type
    });
    for (let edge_id of d.get('edges')) {
      elements.edges.push({
        group: 'edges',
        data: {
          id: `[${id},${edge_id}]`,
          source: id,
          target: edge_id
        },
        classes: type
      });
    }
  });
}

function getBoundingBox(nodes, div, margins) {
  const extremes = {
    top: null,
    right: null,
    bottom: null,
    left: null
  }
  nodes.forEach(function(node) {
    if (
      extremes.top === null ||
      node.position().y < extremes.top.position().y
    ) extremes.top = node;
    if (
      extremes.right === null ||
      node.position().x > extremes.right.position().x
    ) extremes.right = node;
    if (
      extremes.bottom === null ||
      node.position().y > extremes.bottom.position().y
    ) extremes.bottom = node;
    if (
      extremes.left === null ||
      node.position().x < extremes.left.position().x
    ) extremes.left = node;
  });
  return {
    x1: margins.left + extremes.left.outerWidth() / 2,
    y1: margins.top + extremes.top.outerHeight() / 2,
    x2: div.offsetWidth - extremes.right.outerWidth() / 2 - margins.right,
    y2: div.offsetHeight - extremes.bottom.outerHeight() / 2 - margins.bottom
  };
}

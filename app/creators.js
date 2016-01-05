import { createAction } from 'redux-actions'
import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import debounce from 'lodash.debounce'
import store from './store'
import actions from './actions'
import graph_style from '../styles/graph.styl'
import data from '../dev/fishing.json'
CytoscapeDagre(Cytoscape, Dagre);


// This is temporary, for loading sample data
const loadNodes = createAction(
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
);
  
const layoutDone = createAction(
  actions.LAYOUT_DONE,
  function(nodes) {
    const payload = new Map();
    nodes.forEach(function(node) {
      if (!node.hasClass('parent'))
        payload.set(parseInt(node.data().id), node.position());
    });
    return payload;
  });

const layoutGraph = function(data, div) {
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

  // Return promise that resolves upon graph creation and layout,
  // then fires LAYOUT_DONE action
  return new Promise(function(resolve) {
    Cytoscape({
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
        e.cy.nodes().on('free', debounce(function(e) {
          store.dispatch(layoutDone(e.cy.nodes()));
        }));

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
        const chain = e.cy.elements('.chain');
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

        resolve(e.cy.nodes());
      }
    });
  }).then(layoutDone);
}

export default {
  loadNodes,
  layoutGraph
}

function addElements(type, data, elements) {
  elements.nodes.push({
    group: 'nodes',
    data: {id: type},
    classes: 'parent'
  });
  data[type].forEach(function(d, id) {
    const classes = [type];
    const position = d.get('position');
    if (position !== undefined) classes.push(position);
    const disruption = d.get('disruption');
    if (disruption !== undefined) classes.push(disruption);
    
    elements.nodes.push({
      group: 'nodes',
      data: {
        id,
        parent: type,
        label: d.get('name')
      },
      classes: classes.join(' ')
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

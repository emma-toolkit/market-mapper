import { createAction } from 'redux-actions'
import Promise from 'bluebird'
import FastCSV from 'fast-csv'
import store from './store'
import actions from './actions'
import graph from './graph'
import data from '../dev/fishing.json'
const writeToString = Promise.promisify(FastCSV.writeToString);

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
  }
);

const exportDone = createAction(actions.EXPORT_DONE);

const layoutGraph = function(data, div) {
  // Init nodes and edges
  const elements = {
    nodes: [],
    edges: []
  };
  addElements('environment', data, elements);
  addElements('chain', data, elements);
  addElements('infrastructure', data, elements);

  // Return promise that resolves when layout is done
  return graph(elements, div);
}

const exportData = function() {
  const data = [];
  const state = store.getState();
  addData('environment', data, state);
  addData('chain', data, state);
  addData('infrastructure', data, state);

  return writeToString(data, {
    headers: ['id', 'name', 'edges', 'position', 'disruption', 'x', 'y']
  }).then(function(str) {
    window.open(`data:text/csv;charset=utf-8,${escape(str)}`);
  }).then(exportDone);
};

export default {
  loadNodes,
  layoutGraph,
  layoutDone,
  exportData
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

function addData(type, data, state) {
  state.get(type).forEach(function(val, key) {
    const node = val.toObject();
    node.id = key;
    data.push(node);
  });
}

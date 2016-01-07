import { createAction } from 'redux-actions'
import { Map as IMap } from 'immutable'
import Promise from 'bluebird'
import FastCSV from 'fast-csv'
import actions from './actions'
import format from './format'
import { Node, Edge } from './records'
import graph from './graph'

const writeToString = Promise.promisify(FastCSV.writeToString);
const reader = new FileReader();

const loadDone = createAction(actions.LOAD_DONE);

const loadCSV = files => {
  reader.readAsText(files.item(0));
  return new Promise(resolve => {
    reader.onload = e => resolve(e.target.result);
  }).then(str => {
    const element_map = new Map();
    const parser = FastCSV.fromString(str, {headers: true});
    parser.on('data', (d) => element_map.set(parseInt(d.id), d));
    return new Promise(resolve => {
      parser.on('end', () => resolve(format.csv(element_map)));
    });
  }).then(loadDone);
};

const layoutDone = createAction(
  actions.LAYOUT_DONE,
  nodes => {
    const payload = new Map();
    nodes.forEach(function(node) {
      if (!node.hasClass('parent'))
        payload.set(parseInt(node.data().id), node.position());
    });
    return payload;
  },
  persist
);

const exportDone = createAction(actions.EXPORT_DONE);

const layoutGraph = (div, state) => {
  const elements = {
    nodes: [],
    edges: []
  };

  // Add nodes
  graphAddNodes('environment', state, elements);
  graphAddNodes('chain', state, elements);
  graphAddNodes('infrastructure', state, elements);

  // Add edges
  graphAddEdges('chain', state, elements);
  graphAddEdges('infrastructure', state, elements);

  // Return promise that resolves when layout is done
  return graph(div, elements);
}

const exportCSV = (state) => {
  const data = [];
  csvAddNodes('environment', data, state);
  csvAddNodes('chain', data, state);
  csvAddNodes('infrastructure', data, state);
  csvAddEdges('chain', data, state);
  csvAddEdges('infrastructure', data, state);

  return writeToString(data, {
    headers: [
      'id', 'element', 'type', 'label', 'in', 'out', 'disruption', 'x', 'y'
    ]
  }).then(function(str) {
    window.open(`data:text/csv;charset=utf-8,${escape(str)}`);
  }).then(exportDone);
};

export default {
  loadCSV,
  loadDone,
  layoutGraph,
  layoutDone,
  exportCSV
}

function persist() {
  return {persist: true};
}

function graphAddNodes(type, state, elements) {
  elements.nodes.push({
    group: 'nodes',
    data: {id: type},
    classes: 'parent'
  });
  state.getIn(['nodes', type]).forEach((d, id) => {
    const classes = [type];
    const position = d.get('position');
    if (position !== null)
      classes.push(position);
    switch (d.get('disruption')) {
      case 1:
        classes.push('partial');
        break;
      case 2:
        classes.push('major');
        break;
      case 3:
        classes.push('critical');
    }
    
    elements.nodes.push({
      group: 'nodes',
      data: {
        id,
        parent: type,
        label: d.get('label')
      },
      classes: classes.join(' ')
    });
  });
}

function graphAddEdges(type, state, elements) {
  state.getIn(['edges', type]).forEach((d, id) => {
    elements.edges.push({
      group: 'edges',
      data: {
        id: id,
        source: d.get('in'),
        target: d.get('out')
      },
      classes: type
    });
  });
}

function csvAddNodes(type, data, state) {
  state.getIn(['nodes', type]).forEach((d, id) => {
    data.push({
      id: id,
      element: 'node',
      type: type,
      label: d.get('label'),
      in: d.get('position') === 'initial' ? -1 : '',
      out: d.get('position') === 'final' ? -1 : '',
      disruption: d.get('disruption'),
      x: d.get('x'),
      y: d.get('y')
    });
  });
}

function csvAddEdges(type, data, state) {
  state.getIn(['edges', type]).forEach((d, id) => {
    data.push({
      id: id,
      element: 'edge',
      label: d.get('label'),
      in: d.get('in'),
      out: d.get('out'),
      disruption: d.get('disruption')
    });
  });
}

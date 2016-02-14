import { createAction } from 'redux-actions'
import Promise from 'bluebird'
import FastCSV from 'fast-csv'
import local from './localforage'
import actions from './actions'
import csv from './csv'

const writeToString = Promise.promisify(FastCSV.writeToString);
const reader = new FileReader();

// Synchronous

const loadDone = createAction(
  actions.LOAD_DONE,
  payload => {
    payload.last_redraw = Date.now();
    return payload;
  },
  persistGraph
);

const doLayout = createAction(
  actions.DO_LAYOUT,
  () => {return {last_layout: Date.now()}}
);

const layoutDone = createAction(
  actions.LAYOUT_DONE,
  data => data,
  persistGraph
);

const redraw = createAction(
  actions.REDRAW,
  () => {return {last_redraw: Date.now()}}
);

const clear = createAction(
  actions.CLEAR,
  () => {return {last_layout: Date.now()}},
  persistGraph
);

const exportDone = createAction(actions.EXPORT_DONE);

const toggleControls = createAction(
  actions.TOGGLE_CONTROLS,
  show_controls => {
    return {
      show_controls,
      last_redraw: Date.now()
    }
  },
  persistApp
);

const addNode = createAction(
  actions.ADD_NODE,
  domain => {
    return {
      domain,
      last_redraw: Date.now()
    }
  },
  persistGraph
);

const removeNode = createAction(
  actions.REMOVE_NODE,
  node => {
    return {
      node,
      last_redraw: Date.now()
    };
  },
  persistGraph
);

const selectNode = createAction(
  actions.SELECT_NODE,
  node => {return {node}}
);

const deselectNode = createAction(
  actions.DESELECT_NODE
);

const targetNode = createAction(
  actions.TARGET_NODE,
  node => {return {node}}
);

const untargetNode = createAction(
  actions.UNTARGET_NODE
);

const addEdge = createAction(
  actions.ADD_EDGE,
  (from, to) => {
    return {
      from,
      to,
      last_redraw: Date.now()
    };
  },
  persistGraph
);

// Promises

const loadLocal = state => local.load(state)
  .then((next_state) => loadDone({state: next_state}));

const loadCSV = files => {
  reader.readAsText(files.item(0));
  return new Promise(resolve =>
    reader.onload = e => resolve(e.target.result)
  ).then(str => {
    const element_map = new Map();
    const parser = FastCSV.fromString(str, {headers: true});
    parser.on('data', (d) => element_map.set(d.id, d));
    return new Promise(resolve => {
      parser.on('end', () => resolve({state: csv(element_map)}));
    });
  }).then(loadDone);
};

const exportCSV = (state) => {
  const data = [];
  csvAddNodes('environment', data, state);
  csvAddNodes('chain', data, state);
  csvAddNodes('infrastructure', data, state);
  csvAddEdges('chain', data, state);
  csvAddEdges('infrastructure', data, state);

  return writeToString(data, {
    headers: [
      'id', 'element', 'domain', 'label', 'in', 'out', 'disruption', 'x', 'y'
    ]
  }).then(function(str) {
    window.open(`data:text/csv;charset=utf-8,${escape(str)}`);
  }).then(exportDone);
};

// Exports

export default {
  loadDone,
  doLayout,
  layoutDone,
  redraw,
  clear,
  toggleControls,
  addNode,
  removeNode,
  selectNode,
  deselectNode,
  targetNode,
  untargetNode,
  addEdge,
  loadLocal,
  loadCSV,
  exportCSV
}

// Functions

function persistApp() {return {persist_app: true}}
function persistGraph() {return {persist_graph: true}}

function csvAddNodes(domain, data, state) {
  state.getIn(['nodes', domain]).forEach((d, id) => {
    data.push({
      id: id,
      element: 'node',
      domain: domain,
      label: d.get('name'),
      from: d.get('position') === 'initial' ? -1 : '',
      to: d.get('position') === 'final' ? -1 : '',
      disruption: d.get('disruption'),
      x: d.get('x'),
      y: d.get('y')
    });
  });
}

function csvAddEdges(domain, data, state) {
  state.getIn(['edges', domain]).forEach((d, id) => {
    data.push({
      id: id,
      element: 'edge',
      label: d.get('name'),
      from: d.get('from'),
      to: d.get('to'),
      disruption: d.get('disruption')
    });
  });
}

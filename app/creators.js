import { createAction } from 'redux-actions'
import { Map as IMap } from 'immutable'
import Promise from 'bluebird'
import Local from 'localforage'
import FastCSV from 'fast-csv'
import actions from './actions'
import format from './format'
import { Node, Edge } from './records'

const writeToString = Promise.promisify(FastCSV.writeToString);
const reader = new FileReader();

const loadDone = createAction(
  actions.LOAD_DONE,
  payload => {
    payload.last_refresh = Date.now();
    return payload;
  },
  persist
);

const loadLocal = () => {
  const element_map = new Map();
  return Local.iterate((element, id) => {
    element_map.set(id, element);
  }).then(() => loadDone({state: format.local(element_map)}));
};

const loadCSV = files => {
  reader.readAsText(files.item(0));
  return new Promise(resolve => {
    reader.onload = e => resolve(e.target.result);
  }).then(str => {
    const element_map = new Map();
    const parser = FastCSV.fromString(str, {headers: true});
    parser.on('data', (d) => element_map.set(parseInt(d.id), d));
    return new Promise(resolve => {
      parser.on('end', () => resolve({state: format.csv(element_map)}));
    });
  }).then(loadDone);
};

const doLayout = createAction(
  actions.DO_LAYOUT,
  () => {return {last_layout: Date.now()}}
);

const layoutDone = createAction(
  actions.LAYOUT_DONE,
  nodes => {
    const payload = new Map();
    nodes.forEach(function(node) {
      payload.set(parseInt(node.data().id), node.position());
    });
    return payload;
  },
  persist
);

const exportDone = createAction(actions.EXPORT_DONE);

const clear = createAction(
  actions.CLEAR,
  () => {return {last_layout: Date.now()}},
  persist
);

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
  loadLocal,
  loadCSV,
  loadDone,
  doLayout,
  layoutDone,
  clear,
  exportCSV
}

function persist() {return {persist: true}}

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

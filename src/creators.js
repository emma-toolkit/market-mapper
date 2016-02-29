import { createAction } from 'redux-actions'
import Promise from 'bluebird'
import { Map as IMap } from 'immutable'
import { Node, Edge } from './records'
import ShortID from 'shortid'
import html2canvas from 'html2canvas'
import reducers from './reducers'
import local from './localforage'
import actions from './actions'

const reader = new FileReader();

// Synchronous

const resetGraph = createAction(
  actions.RESET_GRAPH,
  () => {return {state: reducers()}}
);

const hideSplash = createAction(
  actions.HIDE_SPLASH
);

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

const showGraphControls = createAction(
  actions.SHOW_GRAPH_CONTROLS
);

const addNode = createAction(
  actions.ADD_NODE,
  () => {
    return {
      id: ShortID.generate(),
      last_redraw: Date.now()
    }
  },
  persistGraph
);

const addNote = createAction(
  actions.ADD_NOTE,
  () => {
    return {
      id: ShortID.generate(),
      last_redraw: Date.now()
    }
  }
);

const removeElement = createAction(
  actions.REMOVE_ELEMENT,
  element => {
    return {
      element,
      last_redraw: Date.now()
    };
  },
  persistGraph
);

const selectElement = createAction(
  actions.SELECT_ELEMENT,
  element => {return {element}}
);

const deselectElement = createAction(
  actions.DESELECT_ELEMENT
);

const setInHandle = createAction(
  actions.SET_IN_HANDLE,
  (id, x, y) => {return {id, x, y}}
);

const setOutHandle = createAction(
  actions.SET_OUT_HANDLE,
  (nodetype, id, x, y) => {return {nodetype, id, x, y}}
);

const clearInHandle = createAction(
  actions.CLEAR_IN_HANDLE
);

const clearOutHandle = createAction(
  actions.CLEAR_OUT_HANDLE
);

const startConnecting = createAction(
  actions.START_CONNECTING
);

const endConnecting = createAction(
  actions.END_CONNECTING
);

const setDisruptions = createAction(
  actions.SET_DISRUPTIONS,
  disruptions => {return {disruptions}}
);

const addEdge = createAction(
  actions.ADD_EDGE,
  (nodetype, from_id, to_id) => {
    return {
      nodetype,
      id: ShortID.generate(),
      from_id,
      to_id,
      last_redraw: Date.now()
    }
  },
  persistGraph
);

const setElementAttribute = createAction(
  actions.SET_ELEMENT_ATTRIBUTE,
  (element, attribute, value, state_num) => {
    return {
      element,
      attribute,
      value,
      state_num,
      last_redraw: Date.now()
    };
  },
  persistGraph
);

const setGraphAttribute = createAction(
  actions.SET_GRAPH_ATTRIBUTE,
  (attribute, value) => {return {attribute, value}},
  persistGraph
);

const exportJSON = createAction(
  actions.EXPORT_JSON,
  state => {
    const title = state.getIn(['graph', 'title']);
    const data = {
      title,
      nodes: [],
      edges: []
    };
    jsonAddNodes('environment', data, state);
    jsonAddNodes('chain', data, state);
    jsonAddNodes('infrastructure', data, state);
    jsonAddEdges('chain', data, state);
    jsonAddEdges('infrastructure', data, state);

    const filename = getFilename(title, 'json');
    const json = JSON.stringify(data, null, 2);
    const dataURL = `data:application/octet-stream;charset=utf-8,${escape(json)}`;
    download(dataURL, filename);
    return;
  }
);

const exportPNG = createAction(
  actions.EXPORT_PNG,
  (el, title) => {
    const filename = getFilename(title, 'png');
    html2canvas(el, {
      background: '#FFFFFF',
      // onclone(new_el) {
      // }
    }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      download(dataURL, filename);
    });
  }
);

const setState = createAction(
  actions.SET_STATE,
  num => {
    return {
      num,
      last_redraw: Date.now()
    }
  },
  persistAll
);

const addState = createAction(
  actions.ADD_STATE,
  () => {},
  persistGraph
);

const removeState = createAction(
  actions.REMOVE_STATE,
  num => {
    return {
      num,
      last_redraw: Date.now()
    }
  },
  persistAll
);

const setStateName = createAction(
  actions.SET_STATE_NAME,
  (num, name) => {return {num, name}}
);

// Promises

const newGraph = () =>
  local.clear()
    .then(resetGraph);

const loadLocal = state => local.load(state)
  .then((next_state) => loadDone({state: next_state}));

const loadJSON = files => {
  reader.readAsText(files.item(0));
  return new Promise(resolve =>
    reader.onload = e => resolve(e.target.result)
  ).then(str => {
    const data = JSON.parse(str);
    let state = new IMap({
      graph: new IMap({title: data.title}),
      nodes: new IMap({
        environment: new IMap(),
        chain: new IMap(),
        infrastructure: new IMap()
      }),
      edges: new IMap({
        chain: new IMap(),
        infrastructure: new IMap()
      })
    });

    for (var i in data.nodes) {
      const node = Node(data.nodes[i]);
      state = state.setIn(
        ['nodes', node.get('nodetype'), node.get('id')],
        node
      );
    }
    for (var i in data.edges) {
      const edge = Edge(data.edges[i]);
      state = state.setIn(
        ['edges', edge.get('nodetype'), edge.get('id')],
        edge
      );
    }

    return {state};
  }).then(loadDone);
};

// Exports

export default {
  newGraph,
  hideSplash,
  loadDone,
  doLayout,
  layoutDone,
  redraw,
  clear,
  toggleControls,
  showGraphControls,
  addNode,
  addNote,
  removeElement,
  selectElement,
  deselectElement,
  setInHandle,
  setOutHandle,
  clearInHandle,
  clearOutHandle,
  startConnecting,
  endConnecting,
  setDisruptions,
  addEdge,
  setElementAttribute,
  setGraphAttribute,
  loadLocal,
  loadJSON,
  exportJSON,
  exportPNG,
  setState,
  addState,
  removeState,
  setStateName
}

// Functions

function persistApp() {return {persist_app: true}}
function persistGraph() {return {persist_graph: true}}
function persistAll() {
  return {
    persist_app: true,
    persist_graph: true
  };
}

function getFilename(title, extension) {
  let filename = title ? `${title} ` : '';
  return `${filename}${new Date().toISOString()}.${extension}`;
}

function download(dataURL, filename) {
  const a = document.createElement('A');
  a.href = dataURL;
  a.download = filename;
  a.click();
}

function jsonAddNodes(nodetype, data, state) {
  state.getIn(['nodes', nodetype]).forEach(node => {
    data.nodes.push({
      id: node.get('id'),
      nodetype,
      name: node.get('name'),
      color: node.get('color'),
      quantities: node.get('quantities'),
      disruption: node.get('disruption'),
      x: node.get('x'),
      y: node.get('y')
    });
  });
}

function jsonAddEdges(nodetype, data, state) {
  state.getIn(['edges', nodetype]).forEach(edge => {
    data.edges.push({
      id: edge.get('id'),
      nodetype,
      from: edge.get('from'),
      to: edge.get('to'),
      width: edge.get('width'),
      quantities: edge.get('quantities'),
      disruption: edge.get('disruption')
    });
  });
}

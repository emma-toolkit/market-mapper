import { createAction } from 'redux-actions'
import Promise from 'bluebird'
import { Map as IMap, List } from 'immutable'
import { Node, Edge, Note } from './records'
import ShortID from 'shortid'
import html2canvas from 'html2canvas'
import reducers from './reducers'
import local from './localforage'
import actions from './actions'

const reader = new FileReader();

// Synchronous

const resetGraph = createAction(
  actions.RESET_GRAPH,
  () => {
    const now = Date.now();
    let state = reducers();
    state = state.mergeIn(['graph'], {
      created_at: now,
      edited_at: now
    });
    return {state};
  },
  persistGraph
);

const showSplash = createAction(
  actions.SHOW_SPLASH
);

const hideSplash = createAction(
  actions.HIDE_SPLASH
);

const loadDone = createAction(
  actions.LOAD_DONE,
  payload => {
    const now = Date.now();
    payload.state = payload.state.mergeDeep({
      app: { last_redraw: now },
      graph: { edited_at: now }
    });
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
  nodes => {
    return {
      nodes,
      edited_at: Date.now()
    }
  },
  persistGraph
);

const redraw = createAction(
  actions.REDRAW,
  () => {return {last_redraw: Date.now()}}
);

const clear = createAction(
  actions.CLEAR,
  () => {
    const now = Date.now();
    return {
      last_layout: now,
      edited_at: now
    };
  },
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

const showLegendControls = createAction(
  actions.SHOW_LEGEND_CONTROLS
);

const addNode = createAction(
  actions.ADD_NODE,
  nodetype => {
    const now = Date.now();
    return {
      nodetype,
      id: ShortID.generate(),
      last_redraw: now,
      edited_at: now
    }
  },
  persistGraph
);

const addNote = createAction(
  actions.ADD_NOTE,
  () => {
    const now = Date.now();
    return {
      id: ShortID.generate(),
      last_redraw: now,
      edited_at: now
    }
  },
  persistGraph
);

const removeElement = createAction(
  actions.REMOVE_ELEMENT,
  element => {
    const now = Date.now();
    return {
      element,
      last_redraw: now,
      edited_at: now
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

const startDraggingNote = createAction(
  actions.START_DRAGGING_NOTE,
  id => {return {id}}
);

const endDraggingNote = createAction(
  actions.END_DRAGGING_NOTE,
  (id, position) => {
    return {
      id,
      position,
      edited_at: Date.now()
    };
  },
  persistGraph
);

const setDisruptions = createAction(
  actions.SET_DISRUPTIONS,
  disruptions => {return {disruptions}}
);

const addEdge = createAction(
  actions.ADD_EDGE,
  (nodetype, from_id, to_id) => {
    const now = Date.now();
    return {
      nodetype,
      id: ShortID.generate(),
      from_id,
      to_id,
      last_redraw: now,
      edited_at: now
    }
  },
  persistGraph
);

const setElementAttribute = createAction(
  actions.SET_ELEMENT_ATTRIBUTE,
  (element, attribute, value, state_num) => {
    const now = Date.now();
    return {
      element,
      attribute,
      value,
      state_num,
      last_redraw: now,
      edited_at: now
    };
  }
);

const setGraphAttribute = createAction(
  actions.SET_GRAPH_ATTRIBUTE,
  (attribute, value) => {
    return {
      attribute,
      value,
      edited_at: Date.now()
    };
  },
  persistGraph
);

const setColorLabel = createAction(
  actions.SET_COLOR_LABEL,
  (color, label) => {
    return {
      color,
      label,
      edited_at: Date.now()
    };
  },
  persistGraph
);

const exportJSON = createAction(
  actions.EXPORT_JSON,
  state => {
    const title = state.getIn(['graph', 'title']);
    const edited_at = state.getIn(['graph', 'edited_at']);
    const data = {
      title,
      created_at: state.getIn(['graph', 'created_at']),
      edited_at,
      states: state.getIn(['graph', 'states']).toArray(),
      legend: state.getIn(['graph', 'legend']).toObject(),
      nodes: [],
      edges: [],
      notes: []
    };
    jsonAddNodes('environment', data, state);
    jsonAddNodes('chain', data, state);
    jsonAddNodes('infrastructure', data, state);
    jsonAddEdges('chain', data, state);
    jsonAddEdges('infrastructure', data, state);
    jsonAddNotes(data, state);

    const filename = getFilename(title, edited_at, 'json');
    const json = JSON.stringify(data, null, 2);
    const dataURL = `data:application/octet-stream;charset=utf-8,${escape(json)}`;
    download(dataURL, filename);
    return;
  }
);

const exportPNG = createAction(
  actions.EXPORT_PNG,
  (el, title, edited_at) => {
    // el.classList.add('rendering');
    const filename = getFilename(title, edited_at, 'png');
    html2canvas(el, {
      background: '#FFFFFF',
      letterRendering: true,
      onclone(new_doc) {
        // const body = new_doc.getElementsByTagName('BODY')[0];
        const body = new_doc.getElementById('display');
        body.style.position = 'absolute';
        body.style.top = 0;
        body.style.left = 0;
        console.log(body.offsetLeft, body.offsetTop);
        console.log(body.offsetWidth, body.offsetHeight);
        console.log(body.style.width, body.style.height);
      }
    }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      download(dataURL, filename);
      // el.classList.remove('rendering');
    });
  }
);

const setState = createAction(
  actions.SET_STATE,
  num => {
    const now = Date.now();
    return {
      num,
      last_redraw: now,
      edited_at: now
    };
  },
  persistAll
);

const addState = createAction(
  actions.ADD_STATE,
  () => {return {edited_at: Date.now()}},
  persistGraph
);

const removeState = createAction(
  actions.REMOVE_STATE,
  num => {
    const now = Date.now();
    return {
      num,
      last_redraw: now,
      edited_at: now
    };
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
      app: new IMap({show_splash: false}),
      graph: new IMap({
        title: data.title,
        created_at: data.created_at,
        edited_at: data.edited_at,
        states: new List(data.states),
        legend: new IMap(data.legend)
      }),
      nodes: new IMap({
        environment: new IMap(),
        chain: new IMap(),
        infrastructure: new IMap()
      }),
      edges: new IMap({
        chain: new IMap(),
        infrastructure: new IMap()
      }),
      notes: new IMap()
    });

    for (var i in data.nodes) {
      const obj = data.nodes[i];
      for (var j in obj.states) {
        obj.states[j] = new IMap(obj.states[j]);
      }
      obj.states = new IMap(obj.states);
      const node = Node(obj);
      state = state.setIn(
        ['nodes', node.get('nodetype'), node.get('id')],
        node
      );
    }
    for (var i in data.edges) {
      const obj = data.edges[i];
      for (var j in obj.states) {
        obj.states[j] = new IMap(obj.states[j]);
      }
      obj.states = new IMap(obj.states);
      const edge = Edge(obj);
      state = state.setIn(
        ['edges', edge.get('nodetype'), edge.get('id')],
        edge
      );
    }
    for (var i in data.notes) {
      const note = Note(data.notes[i]);
      state = state.setIn(['notes', note.get('id')], note);
    }

    return {state};
  }).then(loadDone);
};

// Exports

export default {
  newGraph,
  showSplash,
  hideSplash,
  loadDone,
  doLayout,
  layoutDone,
  redraw,
  clear,
  toggleControls,
  showGraphControls,
  showLegendControls,
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
  startDraggingNote,
  endDraggingNote,
  setDisruptions,
  addEdge,
  setElementAttribute,
  setGraphAttribute,
  setColorLabel,
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

function getFilename(title, edited_at, extension) {
  let filename = title ? `${title} ` : '';
  return `${filename}${new Date(edited_at).toISOString()}.${extension}`;
}

function download(dataURL, filename) {
  const a = document.createElement('A');
  a.href = dataURL;
  a.download = filename;
  a.click();
}

function jsonAddNodes(nodetype, data, state) {
  state.getIn(['nodes', nodetype]).forEach(node => {
    const states = {};
    node.get('states').forEach((stateMap, key) => {
      states[key] = stateMap.toObject();
    });
    data.nodes.push({
      id: node.get('id'),
      nodetype,
      name: node.get('name'),
      color: node.get('color'),
      quantities: node.get('quantities'),
      disruption: node.get('disruption'),
      active: node.get('active'),
      x: node.get('x'),
      y: node.get('y'),
      states
    });
  });
}

function jsonAddEdges(nodetype, data, state) {
  state.getIn(['edges', nodetype]).forEach(edge => {
    const states = {};
    edge.get('states').forEach((stateMap, key) => {
      states[key] = stateMap.toObject();
    });
    data.edges.push({
      id: edge.get('id'),
      nodetype,
      from: edge.get('from'),
      to: edge.get('to'),
      width: edge.get('width'),
      linestyle: edge.get('linestyle'),
      quantities: edge.get('quantities'),
      disruption: edge.get('disruption'),
      active: edge.get('active'),
      states
    });
  });
}

function jsonAddNotes(data, state) {
  state.get('notes').forEach(note => {
    data.notes.push({
      id: note.get('id'),
      text: note.get('text'),
      x: note.get('x'),
      y: note.get('y')
    });
  });
}

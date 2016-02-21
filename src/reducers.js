import { Map as IMap } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import ShortID from 'shortid'
import actions from './actions'
import { Node, Edge } from './records'

export default combineReducers({
  app: createReducer(new IMap({
    last_redraw: null,
    last_layout: null,
    show_controls: true,
    selected: null,
    in_handle: null,
    out_handle: null,
    connecting: false
  }), {
    [actions.LOAD_DONE]: (state, action) => {
      state = action.payload.state.get('app') || state;
      state = state.set('last_redraw', action.payload.last_redraw);
      return state;
    },
    [actions.DO_LAYOUT]: (state, action) =>
      state.set('last_layout', action.payload.last_layout),
    [actions.REDRAW]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.CLEAR]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.TOGGLE_CONTROLS]: (state, action) =>
      state.merge(action.payload),
    [actions.ADD_NODE]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.REMOVE_ELEMENT]: (state, action) =>
      state.merge({
        last_redraw: action.payload.last_redraw,
        selected: null,
        handle: null
      }),
    [actions.SELECT_ELEMENT]: (state, action) =>
      state.set('selected', action.payload.element),
    [actions.DESELECT_ELEMENT]: (state, action) =>
      state.set('selected', null),
    [actions.SET_IN_HANDLE]: (state, action) =>
      state.set('in_handle', {
        id: action.payload.id,
        x: action.payload.x,
        y: action.payload.y
      }),
    [actions.SET_OUT_HANDLE]: (state, action) =>
      state.set('out_handle', {
        nodetype: action.payload.nodetype,
        id: action.payload.id,
        x: action.payload.x,
        y: action.payload.y
      }),
    [actions.CLEAR_IN_HANDLE]: (state, action) =>
      state.set('in_handle', null),
    [actions.CLEAR_OUT_HANDLE]: (state, action) =>
      state.set('out_handle', null),
    [actions.START_CONNECTING]: (state, action) =>
      state.set('connecting', true),
    [actions.END_CONNECTING]: (state, action) =>
      state.set('connecting', false),
    [actions.ADD_EDGE]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.SET_NODE_ATTRIBUTE]: (state, action) => {
      let record = action.payload.node;
      record = record.set(action.payload.attribute, action.payload.value);
      return state.merge({
        last_redraw: action.payload.last_redraw,
        selected: record
      });
    }
  }),
  graph: createReducer(new IMap({
    title: '',
  }), {
    [actions.LOAD_DONE]: (state, action) =>
      state.merge(action.payload.state.get('graph')),
    [actions.SET_GRAPH_ATTRIBUTE]: (state, action) =>
      state.set(action.payload.attribute, action.payload.value)
  }),
  nodes: combineReducers({
    environment: createReducer(new IMap(), nodeHandlers('environment')),
    chain: createReducer(new IMap(), nodeHandlers('chain')),
    infrastructure: createReducer(new IMap(),nodeHandlers('infrastructure'))
  }),
  edges: combineReducers({
    chain: createReducer(new IMap(), edgeHandlers('chain')),
    infrastructure: createReducer(new IMap(), edgeHandlers('infrastructure'))
  })
});

function nodeHandlers(nodetype) {
  const handlers = commonHandlers('nodes', nodetype);
  handlers[actions.LAYOUT_DONE] = (state, action) => {
    for (let [id, coordinates] of action.payload) {
      if (state.has(id)) {
        state = state.mergeIn([id], coordinates);
      }
    }
    return state;
  };
  handlers[actions.ADD_NODE] = (state, action) => {
    if (action.payload.nodetype === nodetype) {
      let y;
      switch (nodetype) {
        case 'environment':
          y = (2160 / 6) - (2160 / 20);
          break;
        case 'chain':
          y = 2160 / 2;
          break;
        case 'infrastructure':
          y = (2160 * (5/6)) + (2160 / 20);
          break;
      }
      const id = ShortID.generate();
      state = state.set(id, Node({
        nodetype,
        id,
        name: '<new node>',
        x: 2048,
        y
      }));
    }
    return state;
  };
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.type === 'nodes' && element.nodetype === nodetype) {
      state = state.delete(element.id);
    }
    return state;
  };
  handlers[actions.SET_NODE_ATTRIBUTE] = (state, action) => {
    const node = action.payload.node;
    if (node.nodetype === nodetype) {
      let record = state.get(node.id);
      record = record.set(action.payload.attribute, action.payload.value);
      state = state.set(node.id, record);
    }
    return state;
  };
  return handlers;
}

function edgeHandlers(nodetype) {
  const handlers = commonHandlers('edges', nodetype);
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.type === 'nodes' && nodetype !== 'environment') {
      const id = element.id;
      state.forEach((edge, key) => {
        if (edge.from === id || edge.to === id) {
          state = state.delete(key);
        }
      });
    } else if (element.type === 'edges' && element.nodetype === nodetype) {
      state = state.delete(element.id);
    }
    return state;
  };
  handlers[actions.ADD_EDGE] = (state, action) => {
    if (action.payload.nodetype === nodetype) {
      const id = ShortID.generate();
      const edge = Edge({
        nodetype,
        id,
        from: action.payload.from_id,
        to: action.payload.to_id
      });
      state = state.set(id, edge);
    }
    return state;
  };
  return handlers;
}

function commonHandlers(type, nodetype) {
  return {
    [actions.LOAD_DONE]: (state, action) =>
      action.payload.state.getIn([type, nodetype]),
    [actions.CLEAR]: state => state.clear()
  };
}

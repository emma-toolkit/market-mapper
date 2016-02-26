import { Map as IMap, Set as ISet } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import ShortID from 'shortid'
import actions from './actions'
import { Node, Edge } from './records'
import config from './config.json'

export default combineReducers({
  app: createReducer(new IMap({
    last_redraw: null,
    last_layout: null,
    show_controls: true,
    selected: null,
    in_handle: null,
    out_handle: null,
    connecting: false,
    disruptions: new ISet()
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
        in_handle: null,
        out_handle: null,
        connecting: false
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
    [actions.SET_DISRUPTIONS]: (state, action) =>
      state.set('disruptions', new ISet(action.payload.disruptions)),
    [actions.ADD_EDGE]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.SET_ELEMENT_ATTRIBUTE]: (state, action) => {
      let record = action.payload.element;
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
      const id = ShortID.generate();

      const x_int = config.layout.w / 8;
      let x = x_int;
      const num_nodes = state.size;
      let i = 0;
      while (i < num_nodes) {
        i = state.forEach(node => {
          if (Math.abs(node.get('x') - x) < x_int) {
            x += x_int;
            return false;
          }
          return true;
        });
      }

      let y;
      switch (nodetype) {
        case 'environment':
          y = (config.layout.h / 6) - (config.layout.h / 20);
          break;
        case 'chain':
          y = config.layout.h / 2;
          break;
        case 'infrastructure':
          y = (config.layout.h * (5/6)) + (config.layout.h / 20);
          break;
      }
      
      state = state.set(id, Node({
        nodetype,
        id,
        x,
        y
      }));
    }
    return state;
  };
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.element === 'nodes' && element.nodetype === nodetype) {
      state = state.delete(element.id);
    }
    return state;
  };
  handlers[actions.SET_ELEMENT_ATTRIBUTE] = (state, action) => {
    if (action.payload.element.element === 'nodes') {
      const node = action.payload.element;
      if (node.nodetype === nodetype) {
        let record = state.get(node.id);
        record = record.set(action.payload.attribute, action.payload.value);
        state = state.set(node.id, record);
      }
    }
    return state;
  };
  return handlers;
}

function edgeHandlers(nodetype) {
  const handlers = commonHandlers('edges', nodetype);
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.element === 'nodes' && nodetype !== 'environment') {
      const id = element.id;
      state.forEach((edge, key) => {
        if (edge.from === id || edge.to === id) {
          state = state.delete(key);
        }
      });
    } else if (element.element === 'edges' && element.nodetype === nodetype) {
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
  handlers[actions.SET_ELEMENT_ATTRIBUTE] = (state, action) => {
    if (action.payload.element.element === 'edges') {
      const edge = action.payload.element;
      if (edge.nodetype === nodetype) {
        let record = state.get(edge.id);
        record = record.set(action.payload.attribute, action.payload.value);
        state = state.set(edge.id, record);
      }
    }
    return state;
  };
  return handlers;
}

function commonHandlers(element, nodetype) {
  return {
    [actions.LOAD_DONE]: (state, action) =>
      action.payload.state.getIn([element, nodetype]),
    [actions.CLEAR]: state => state.clear()
  };
}

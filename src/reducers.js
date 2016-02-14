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
    targeted: null
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
    [actions.REMOVE_NODE]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.SELECT_NODE]: (state, action) =>
      state.set('selected', action.payload.node),
    [actions.DESELECT_NODE]: (state, action) =>
      state.set('selected', null),
    [actions.TARGET_NODE]: (state, action) =>
      state.set('targeted', action.payload.node),
    [actions.UNTARGET_NODE]: (state, action) =>
      state.set('targeted', null)
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

function nodeHandlers(domain) {
  const handlers = commonHandlers('nodes', domain);
  handlers[actions.LAYOUT_DONE] = (state, action) => {
    for (let [id, coordinates] of action.payload) {
      if (state.has(id)) {
        state = state.mergeIn([id], coordinates);
      }
    }
    return state;
  };
  handlers[actions.ADD_NODE] = (state, action) => {
    if (action.payload.domain === domain) {
      let y;
      switch (domain) {
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
        domain,
        id,
        label: "<new node>",
        x: 2048,
        y
      }));
    }
    return state;
  };
  handlers[actions.REMOVE_NODE] = (state, action) => {
    if (action.payload.node.domain === domain) {
      state = state.delete(action.payload.node.id);
    }
    return state;
  };
  return handlers;
}

function edgeHandlers(domain) {
  const handlers = commonHandlers('edges', domain);
  handlers[actions.REMOVE_NODE] = (state, action) => {
    if (domain !== 'environment') {
      const id = action.payload.node.id;
      state.forEach((edge, key) => {
        if (edge.from === id || edge.to === id) {
          state = state.delete(key);
        }
      });
    }
    return state;
  };
  return handlers;
}

function commonHandlers(element, domain) {
  return {
    [actions.LOAD_DONE]: (state, action) =>
      action.payload.state.getIn([element, domain]),
    [actions.CLEAR]: state => state.clear()
  };
}

import { Map as IMap } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import actions from './actions'

export default combineReducers({
  app: createReducer(new IMap({
    last_load: null,
    last_layout: null
  }), {
    [actions.LOAD_DONE]: (state, action) =>
      state.set('last_load', action.payload.timestamp),
    [actions.DO_LAYOUT]: (state, action) =>
      state.set('last_layout', action.payload.timestamp)
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

function nodeHandlers(type) {
  const handlers = commonHandlers('nodes', type);
  handlers[actions.LAYOUT_DONE] = (state, action) => {
    for (let [id, coordinates] of action.payload) {
      if (state.has(id))
        state = state.mergeIn([id], coordinates);
    }
    return state;
  };
  return handlers;
}

function edgeHandlers(type) {
  return commonHandlers('edges', type);
}

function commonHandlers(element, type) {
  return {
    [actions.LOAD_DONE]: (state, action) => {
      return action.payload.getIn([element, type]);
    },
    [actions.CLEAR]: state => state.clear()
  };
}

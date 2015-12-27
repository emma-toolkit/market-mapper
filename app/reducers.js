import { Map as IMap, List } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import { Node } from './records'
import actions from './actions'

const chain_handlers = typeHandlers('chain');
chain_handlers[actions.LAYOUT_CHAIN] = function(state, action) {
  for (let [id, position] of action.payload.nodes) {
    state = state.mergeIn([id], {
      x: position.x,
      y: position.y
    });
  }
  return state;
};

const edges_handlers = {
  [actions.LAYOUT_CHAIN]: function(state, action) {
    for (let [id, position] of action.payload.edges)
      state = state.set(JSON.stringify(id), new List(position));
    return state;
  }
};

export default combineReducers({
  environment: createReducer(new IMap(), typeHandlers('environment')),
  chain: createReducer(new IMap(), chain_handlers),
  infrastructure: createReducer(new IMap(), typeHandlers('infrastructure')),
  edges: createReducer(new IMap(), edges_handlers)
});

function typeHandlers(type) {
  return {
    [actions.LOAD_NODES]: function(state, action) {
      for (let [id, val] of action.payload[type])
        state = state.set(parseInt(id), Node(val));
      return state;
    },
    [actions.INIT_NODE]: function(state, action) {
      const payload = action.payload;
      if (state.has(payload.id))
        state = state.mergeIn([payload.id], {
          x: payload.x,
          y: payload.y,
          w: payload.w,
          h: payload.h
        })
      return state;
    }
  }
}

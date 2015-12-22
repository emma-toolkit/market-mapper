import { Map } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import actions from './actions'

const environment = createReducer(new Map(), {
  [actions.LOAD_NODES]: function(state, action) {
    return loadNodeType('environment', state, action.payload);
  }
});

const chain = createReducer(new Map(), {
  [actions.LOAD_NODES]: function(state, action) {
    return loadNodeType('chain', state, action.payload);
  }
});

const infrastructure = createReducer(new Map(), {
  [actions.LOAD_NODES]: function(state, action) {
    return loadNodeType('infrastructure', state, action.payload);
  }
});

export default combineReducers({
  environment: environment,
  chain: chain,
  infrastructure: infrastructure,
});

function loadNodeType(type, state, payload) {
  const data = payload[type];
  for (let id in data) {
    state = state.set(id, data[id]);
  }
  return state;
}

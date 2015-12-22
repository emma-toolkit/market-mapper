import { Map as IMap } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import actions from './actions'

const environment = createReducer(new IMap(), {
  [actions.LOAD_NODES]: function(state, action) {
    return loadNodeType('environment', state, action.payload);
  }
});

const chain = createReducer(new IMap(), {
  [actions.LOAD_NODES]: function(state, action) {
    return loadNodeType('chain', state, action.payload);
  }
});

const infrastructure = createReducer(new IMap(), {
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
  for (let [id, val] of payload[type])
    state = state.set(id, val);
  return state;
}
